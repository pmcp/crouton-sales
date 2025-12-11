import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import { posEvents } from '~~/layers/pos/collections/events/server/database/schema'
import { posCategories } from '~~/layers/pos/collections/categories/server/database/schema'
import { posLocations } from '~~/layers/pos/collections/locations/server/database/schema'
import { posProducts } from '~~/layers/pos/collections/products/server/database/schema'
import { posPrinters } from '~~/layers/pos/collections/printers/server/database/schema'

export default defineEventHandler(async (event) => {
  const { team, user } = await resolveTeamAndCheckMembership(event)
  const eventId = getRouterParam(event, 'eventId')

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  const db = useDB()

  // 1. Get the original event
  const [originalEvent] = await db
    .select()
    .from(posEvents)
    .where(
      and(
        eq(posEvents.id, eventId),
        eq(posEvents.teamId, team.id)
      )
    )
    .limit(1)

  if (!originalEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
    })
  }

  // 2. Create the new event with "(Copy)" suffix
  const newEventId = nanoid()
  const timestamp = Date.now()
  const [newEvent] = await db
    .insert(posEvents)
    .values({
      id: newEventId,
      teamId: team.id,
      owner: user.id,
      title: `${originalEvent.title} (Copy)`,
      slug: `${originalEvent.slug}-copy-${timestamp}`,
      description: originalEvent.description,
      eventType: originalEvent.eventType,
      startDate: null,
      endDate: null,
      status: originalEvent.status,
      isCurrent: false,
      helperPin: originalEvent.helperPin,
      metadata: originalEvent.metadata,
      archivedAt: null,
      createdBy: user.id,
      updatedBy: user.id,
    })
    .returning()

  // 3. Copy categories and build categoryMap
  const categories = await db
    .select()
    .from(posCategories)
    .where(eq(posCategories.eventId, eventId))

  const categoryMap: Record<string, string> = {}
  for (const cat of categories) {
    const newCatId = nanoid()
    categoryMap[cat.id] = newCatId
    await db.insert(posCategories).values({
      id: newCatId,
      teamId: team.id,
      owner: user.id,
      eventId: newEventId,
      title: cat.title,
      displayOrder: cat.displayOrder,
      createdBy: user.id,
      updatedBy: user.id,
    })
  }

  // 4. Copy locations and build locationMap
  const locations = await db
    .select()
    .from(posLocations)
    .where(eq(posLocations.eventId, eventId))

  const locationMap: Record<string, string> = {}
  for (const loc of locations) {
    const newLocId = nanoid()
    locationMap[loc.id] = newLocId
    await db.insert(posLocations).values({
      id: newLocId,
      teamId: team.id,
      owner: user.id,
      eventId: newEventId,
      title: loc.title,
      createdBy: user.id,
      updatedBy: user.id,
    })
  }

  // 5. Copy products (remap categoryId and locationId)
  const products = await db
    .select()
    .from(posProducts)
    .where(eq(posProducts.eventId, eventId))

  for (const prod of products) {
    await db.insert(posProducts).values({
      id: nanoid(),
      teamId: team.id,
      owner: user.id,
      eventId: newEventId,
      categoryId: prod.categoryId ? categoryMap[prod.categoryId] : null,
      locationId: prod.locationId ? locationMap[prod.locationId] : null,
      title: prod.title,
      description: prod.description,
      price: prod.price,
      isActive: prod.isActive,
      requiresRemark: prod.requiresRemark,
      remarkPrompt: prod.remarkPrompt,
      hasOptions: prod.hasOptions,
      multipleOptionsAllowed: prod.multipleOptionsAllowed,
      sortOrder: prod.sortOrder,
      createdBy: user.id,
      updatedBy: user.id,
    })
  }

  // 6. Copy printers (remap locationId)
  const printers = await db
    .select()
    .from(posPrinters)
    .where(eq(posPrinters.eventId, eventId))

  for (const printer of printers) {
    // Only copy printer if its location was successfully mapped
    const newLocationId = locationMap[printer.locationId]
    if (!newLocationId) continue

    await db.insert(posPrinters).values({
      id: nanoid(),
      teamId: team.id,
      owner: user.id,
      eventId: newEventId,
      locationId: newLocationId,
      title: printer.title,
      ipAddress: printer.ipAddress,
      ...(printer.port && { port: printer.port }),
      ...(printer.status && { status: printer.status }),
      ...(printer.showPrices !== null && { showPrices: printer.showPrices }),
      ...(printer.isActive !== null && { isActive: printer.isActive }),
      createdBy: user.id,
      updatedBy: user.id,
    })
  }

  return newEvent
})
