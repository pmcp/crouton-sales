// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosOrder } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosOrder } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { orderId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosOrder>>(event)

  return await updatePosOrder(orderId, team.id, user.id, {
    id: body.id,
    eventId: body.eventId,
    clientId: body.clientId,
    clientName: body.clientName,
    eventOrderNumber: body.eventOrderNumber,
    overallRemarks: body.overallRemarks,
    isPersonnel: body.isPersonnel,
    status: body.status
  })
})