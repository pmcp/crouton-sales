import { eq, and, gt } from 'drizzle-orm'
import { posEvents } from '~~/layers/pos/collections/events/server/database/schema'
import { posHelpers } from '~~/layers/pos/collections/helpers/server/database/schema'
import { posProducts } from '~~/layers/pos/collections/products/server/database/schema'
import { posCategories } from '~~/layers/pos/collections/categories/server/database/schema'

// Helper-authenticated endpoint to get all data needed for order interface
export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'eventId')

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  // Get helper token from cookie or header
  const helperToken = getCookie(event, 'pos-helper-token')
    || getHeader(event, 'x-helper-token')

  if (!helperToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Helper authentication required',
    })
  }

  const db = useDB()

  // Validate helper token
  const [helper] = await db
    .select()
    .from(posHelpers)
    .where(
      and(
        eq(posHelpers.token, helperToken),
        eq(posHelpers.eventId, eventId),
        eq(posHelpers.isActive, true),
        gt(posHelpers.expiresAt, new Date())
      )
    )
    .limit(1)

  if (!helper) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired helper session',
    })
  }

  // Update last active timestamp
  await db
    .update(posHelpers)
    .set({ lastActiveAt: new Date() })
    .where(eq(posHelpers.id, helper.id))

  // Get the event
  const [posEvent] = await db
    .select()
    .from(posEvents)
    .where(eq(posEvents.id, eventId))
    .limit(1)

  if (!posEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
    })
  }

  // Get all products for this event
  const products = await db
    .select()
    .from(posProducts)
    .where(eq(posProducts.eventId, eventId))

  // Get all categories for this event's team
  const categories = await db
    .select()
    .from(posCategories)
    .where(eq(posCategories.teamId, posEvent.teamId))

  return {
    event: {
      id: posEvent.id,
      title: posEvent.title,
      slug: posEvent.slug,
      teamId: posEvent.teamId,
    },
    products,
    categories,
    helper: {
      id: helper.id,
      name: helper.title,
    },
  }
})
