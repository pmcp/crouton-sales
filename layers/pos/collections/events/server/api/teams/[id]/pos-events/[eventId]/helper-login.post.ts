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
  const { pin, helperName } = body

  if (!pin) {
    throw createError({
      statusCode: 400,
      statusMessage: 'PIN is required',
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

  // Generate a token and create a helper session
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now

  const [helper] = await db
    .insert(posHelpers)
    .values({
      teamId,
      owner: 'system', // System-created helper session
      eventId,
      title: helperName || 'Helper',
      token,
      isActive: true,
      expiresAt,
      lastActiveAt: new Date(),
      createdBy: 'system',
      updatedBy: 'system',
    })
    .returning()

  return {
    token: helper.token,
    helperName: helper.title,
    eventId: helper.eventId,
    expiresAt: helper.expiresAt,
  }
})
