// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosProductOption } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosProductOption } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { productoptionId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosProductOption>>(event)

  return await updatePosProductOption(productoptionId, team.id, user.id, {
    id: body.id,
    productId: body.productId,
    optionName: body.optionName,
    additionalPrice: body.additionalPrice,
    displayOrder: body.displayOrder
  })
})