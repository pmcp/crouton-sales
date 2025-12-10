// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updateCroutonCollectionEvent } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { CroutonCollectionEvent } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { eventId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<CroutonCollectionEvent>>(event)

  return await updateCroutonCollectionEvent(eventId, team.id, user.id, {
    id: body.id,
    timestamp: body.timestamp,
    operation: body.operation,
    collectionName: body.collectionName,
    itemId: body.itemId,
    userId: body.userId,
    userName: body.userName,
    changes: body.changes,
    metadata: body.metadata,
  })
})
