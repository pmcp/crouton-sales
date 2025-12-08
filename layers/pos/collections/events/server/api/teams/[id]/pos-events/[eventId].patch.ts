// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosEvent } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosEvent } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { eventId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosEvent>>(event)

  return await updatePosEvent(eventId, team.id, user.id, {
    id: body.id,
    name: body.name,
    slug: body.slug,
    description: body.description,
    eventType: body.eventType,
    startDate: body.startDate ? new Date(body.startDate) : body.startDate,
    endDate: body.endDate ? new Date(body.endDate) : body.endDate,
    status: body.status,
    isCurrent: body.isCurrent,
    helperPin: body.helperPin,
    metadata: body.metadata,
    archivedAt: body.archivedAt ? new Date(body.archivedAt) : body.archivedAt
  })
})