// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosHelper } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosHelper } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { helperId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosHelper>>(event)

  return await updatePosHelper(helperId, team.id, user.id, {
    id: body.id,
    eventId: body.eventId,
    title: body.title,
    token: body.token,
    isActive: body.isActive,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : body.expiresAt,
    lastActiveAt: body.lastActiveAt ? new Date(body.lastActiveAt) : body.lastActiveAt
  })
})