// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosCategorie } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosCategorie } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { categorieId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosCategorie>>(event)

  return await updatePosCategorie(categorieId, team.id, user.id, {
    id: body.id,
    eventId: body.eventId,
    name: body.name,
    displayOrder: body.displayOrder
  })
})