// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosLocation } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosLocation } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { locationId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosLocation>>(event)

  return await updatePosLocation(locationId, team.id, user.id, {
    id: body.id,
    eventId: body.eventId,
    name: body.name
  })
})