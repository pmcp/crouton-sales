// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { updatePosOrderItem } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import type { PosOrderItem } from '../../../../../types'

export default defineEventHandler(async (event) => {
  const { orderitemId } = getRouterParams(event)
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody<Partial<PosOrderItem>>(event)

  return await updatePosOrderItem(orderitemId, team.id, user.id, {
    id: body.id,
    orderId: body.orderId,
    productId: body.productId,
    quantity: body.quantity,
    unitPrice: body.unitPrice,
    totalPrice: body.totalPrice,
    remarks: body.remarks,
    selectedOptions: body.selectedOptions
  })
})