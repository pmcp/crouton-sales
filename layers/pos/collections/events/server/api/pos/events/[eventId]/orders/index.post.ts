import { eq, and, gt, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { posEvents } from '~~/layers/pos/collections/events/server/database/schema'
import { posHelpers } from '~~/layers/pos/collections/helpers/server/database/schema'
import { posOrders } from '~~/layers/pos/collections/orders/server/database/schema'
import { posOrderitems } from '~~/layers/pos/collections/orderitems/server/database/schema'
import { teams } from '~~/server/database/schema'
import { generatePrintQueues } from '~~/layers/pos/server/utils/print-queue-service'

interface OrderItem {
  productId: string
  quantity: number
  price: number
  productName?: string
  remarks?: string
  selectedOptions?: Record<string, any>
}

interface CreateOrderBody {
  items: OrderItem[]
  total: number
  clientId?: string
  clientName?: string
  overallRemarks?: string
  isPersonnel?: boolean
}

// Helper-authenticated endpoint to create orders
export default defineEventHandler(async (event) => {
  console.log('[order] POST /orders called')

  const eventId = getRouterParam(event, 'eventId')
  console.log('[order] eventId:', eventId)

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  // Get helper token from cookie or header
  const helperToken = getCookie(event, 'pos-helper-token')
    || getHeader(event, 'x-helper-token')

  if (!helperToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Helper authentication required',
    })
  }

  const db = useDB()

  // Validate helper token
  const [helper] = await db
    .select()
    .from(posHelpers)
    .where(
      and(
        eq(posHelpers.token, helperToken),
        eq(posHelpers.eventId, eventId),
        eq(posHelpers.isActive, true),
        gt(posHelpers.expiresAt, new Date())
      )
    )
    .limit(1)

  if (!helper) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired helper session',
    })
  }

  // Get the event with team info
  const [eventWithTeam] = await db
    .select({
      event: posEvents,
      team: teams,
    })
    .from(posEvents)
    .leftJoin(teams, eq(posEvents.teamId, teams.id))
    .where(eq(posEvents.id, eventId))
    .limit(1)

  if (!eventWithTeam || !eventWithTeam.event) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
    })
  }

  const posEvent = eventWithTeam.event

  const body = await readBody<CreateOrderBody>(event)

  if (!body.items || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order must have at least one item',
    })
  }

  // Generate event order number (sequential per event)
  const [orderCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posOrders)
    .where(eq(posOrders.eventId, eventId))

  const eventOrderNumber = String((orderCount?.count || 0) + 1).padStart(4, '0')

  // Create the order
  const orderId = nanoid()
  const [order] = await db
    .insert(posOrders)
    .values({
      id: orderId,
      teamId: posEvent.teamId,
      owner: helper.id,
      eventId,
      clientId: body.clientId,
      clientName: body.clientName,
      eventOrderNumber,
      overallRemarks: body.overallRemarks,
      isPersonnel: body.isPersonnel || false,
      status: 'pending',
      createdBy: helper.id,
      updatedBy: helper.id,
    })
    .returning()

  // Create order items
  const orderItems = await Promise.all(
    body.items.map(async (item) => {
      const [orderItem] = await db
        .insert(posOrderitems)
        .values({
          teamId: posEvent.teamId,
          owner: helper.id,
          orderId,
          productId: item.productId,
          quantity: String(item.quantity),
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          remarks: item.remarks,
          selectedOptions: item.selectedOptions || {},
          createdBy: helper.id,
          updatedBy: helper.id,
        })
        .returning()
      return orderItem
    })
  )

  // Update helper's last active timestamp
  await db
    .update(posHelpers)
    .set({ lastActiveAt: new Date() })
    .where(eq(posHelpers.id, helper.id))

  // Generate print queue entries automatically
  const printQueueIds = await generatePrintQueues({
    orderId: order.id,
    eventId: posEvent.id,
    teamId: posEvent.teamId,
    orderNumber: eventOrderNumber,
    clientName: body.clientName || undefined,
    orderNotes: body.overallRemarks || undefined,
    teamName: eventWithTeam.team?.name || 'POS',
    eventName: posEvent.title,
    isPersonnel: body.isPersonnel || false,
    createdBy: helper.id,
  })
  console.log('[order] Generated', printQueueIds.length, 'print queue entries')

  return {
    order,
    items: orderItems,
    eventOrderNumber,
    printQueueIds,
  }
})
