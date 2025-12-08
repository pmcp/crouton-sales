// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosProduct } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosProduct } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { productId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosProduct>>(event)

  return await updatePosProduct(productId, team.id, user.id, {
    id: body.id,
    eventId: body.eventId,
    categoryId: body.categoryId,
    locationId: body.locationId,
    name: body.name,
    description: body.description,
    price: body.price,
    isActive: body.isActive,
    requiresRemark: body.requiresRemark,
    remarkPrompt: body.remarkPrompt,
    hasOptions: body.hasOptions,
    multipleOptionsAllowed: body.multipleOptionsAllowed,
    sortOrder: body.sortOrder
  })
})