// Team-based reorder endpoint for drag-and-drop functionality
import { reorderPosOrders } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'

interface ReorderUpdate {
  id: string
  order: number
}

interface ReorderBody {
  updates: ReorderUpdate[]
}

export default defineEventHandler(async (event) => {
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<ReorderBody>(event)

  if (!body.updates || !Array.isArray(body.updates)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid updates array'
    })
  }

  return await reorderPosOrders(team.id, user.id, body.updates)
})
