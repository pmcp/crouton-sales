// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { getAllPosOrders, getPosOrdersByIds, getPosOrdersByEventId, getPosOrdersByEventIdAndOwner } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'

export default defineEventHandler(async (event) => {
  const { team } = await resolveTeamAndCheckMembership(event)

  const query = getQuery(event)
  if (query.ids) {
    const ids = String(query.ids).split(',')
    return await getPosOrdersByIds(team.id, ids)
  }

  if (query.eventId && query.owner) {
    return await getPosOrdersByEventIdAndOwner(team.id, String(query.eventId), String(query.owner))
  }

  if (query.eventId) {
    return await getPosOrdersByEventId(team.id, String(query.eventId))
  }

  return await getAllPosOrders(team.id)
})