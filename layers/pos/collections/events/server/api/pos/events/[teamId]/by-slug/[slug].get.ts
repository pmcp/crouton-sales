import { eq, and } from 'drizzle-orm'
import { posEvents } from '~~/layers/pos/collections/events/server/database/schema'

// Public endpoint to get event by slug - used for helper login
export default defineEventHandler(async (event) => {
  const teamId = getRouterParam(event, 'teamId')
  const slug = getRouterParam(event, 'slug')

  if (!teamId || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team ID and slug are required',
    })
  }

  const db = useDB()

  const [posEvent] = await db
    .select({
      id: posEvents.id,
      teamId: posEvents.teamId,
      title: posEvents.title,
      slug: posEvents.slug,
      status: posEvents.status,
    })
    .from(posEvents)
    .where(
      and(
        eq(posEvents.teamId, teamId),
        eq(posEvents.slug, slug)
      )
    )
    .limit(1)

  if (!posEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
    })
  }

  return posEvent
})
