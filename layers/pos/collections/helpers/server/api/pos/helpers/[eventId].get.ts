import { eq, and } from 'drizzle-orm'
import { posHelpers } from '~~/layers/pos/collections/helpers/server/database/schema'

// Public endpoint to get helpers for an event - used for helper login selection
export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'eventId')

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  const db = useDB()

  // Only return active helpers with minimal info (id and title)
  const helpers = await db
    .select({
      id: posHelpers.id,
      title: posHelpers.title,
    })
    .from(posHelpers)
    .where(
      and(
        eq(posHelpers.eventId, eventId),
        eq(posHelpers.isActive, true)
      )
    )

  return helpers
})
