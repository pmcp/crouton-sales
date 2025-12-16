import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { posEvents } from '~~/layers/pos/collections/events/server/database/schema'
import { posHelpers } from '~~/layers/pos/collections/helpers/server/database/schema'

export default defineEventHandler(async (event) => {
  const teamId = getRouterParam(event, 'id')
  const eventId = getRouterParam(event, 'eventId')

  if (!teamId || !eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID and Event ID are required',
    })
  }

  const body = await readBody(event)
  const { pin, helperName, helperId } = body

  if (!pin) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PIN is required',
    })
  }

  // Must provide either helperId (existing) or helperName (new)
  if (!helperId && !helperName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Helper name or helper ID is required',
    })
  }

  const db = useDB()

  // Find the event and validate the PIN
  const [posEvent] = await db
    .select()
    .from(posEvents)
    .where(
      and(
        eq(posEvents.id, eventId),
        eq(posEvents.teamId, teamId)
      )
    )
    .limit(1)

  if (!posEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
    })
  }

  if (!posEvent.helperPin) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Helper PIN not configured for this event',
    })
  }

  if (posEvent.helperPin !== pin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid PIN',
    })
  }

  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now

  let helper

  if (helperId) {
    // Update existing helper with new token
    const [existingHelper] = await db
      .select()
      .from(posHelpers)
      .where(
        and(
          eq(posHelpers.id, helperId),
          eq(posHelpers.eventId, eventId),
          eq(posHelpers.teamId, teamId)
        )
      )
      .limit(1)

    if (!existingHelper) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Helper not found',
      })
    }

    const [updatedHelper] = await db
      .update(posHelpers)
      .set({
        token,
        isActive: true,
        expiresAt,
        lastActiveAt: new Date(),
        updatedBy: 'system',
      })
      .where(eq(posHelpers.id, helperId))
      .returning()

    helper = updatedHelper
  }
  else {
    // Create new helper session
    const [newHelper] = await db
      .insert(posHelpers)
      .values({
        teamId,
        owner: 'system', // System-created helper session
        eventId,
        title: helperName,
        token,
        isActive: true,
        expiresAt,
        lastActiveAt: new Date(),
        createdBy: 'system',
        updatedBy: 'system',
      })
      .returning()

    helper = newHelper
  }

  return {
    token: helper.token,
    helperName: helper.title,
    eventId: helper.eventId,
    expiresAt: helper.expiresAt,
  }
})
