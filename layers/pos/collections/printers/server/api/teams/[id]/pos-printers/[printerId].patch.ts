// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosPrinter } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosPrinter } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { printerId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosPrinter>>(event)

  return await updatePosPrinter(printerId, team.id, user.id, {
    id: body.id,
    eventId: body.eventId,
    locationId: body.locationId,
    name: body.name,
    ipAddress: body.ipAddress,
    port: body.port,
    status: body.status,
    showPrices: body.showPrices,
    isActive: body.isActive
  })
})