// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosEventSetting } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosEventSetting } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { eventsettingId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosEventSetting>>(event)

  return await updatePosEventSetting(eventsettingId, team.id, user.id, {
    id: body.id,
    eventId: body.eventId,
    settingKey: body.settingKey,
    settingValue: body.settingValue,
    description: body.description
  })
})