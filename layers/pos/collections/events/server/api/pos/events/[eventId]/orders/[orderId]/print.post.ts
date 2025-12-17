import { eq, and, gt } from 'drizzle-orm'
import { posEvents } from '~~/layers/pos/collections/events/server/database/schema'
import { posHelpers } from '~~/layers/pos/collections/helpers/server/database/schema'
import { posOrders } from '~~/layers/pos/collections/orders/server/database/schema'
import { teams } from '~~/server/database/schema'
import { generatePrintQueues } from '~~/layers/pos/server/utils/print-queue-service'

// Helper-authenticated endpoint to trigger print queue generation for an order
export default defineEventHandler(async (event) => {
  console.log('[print] POST /print-server/orders/.../print called')

  const orderId = getRouterParam(event, 'orderId')
  console.log('[print] orderId:', orderId)

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required',
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

  // Get the order first to find the eventId
  const [order] = await db
    .select()
    .from(posOrders)
    .where(eq(posOrders.id, orderId))
    .limit(1)

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found',
    })
  }

  const eventId = order.eventId

  // Validate helper token against the order's event
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
  const [posEvent] = await db
    .select({
      event: posEvents,
      team: teams
    })
    .from(posEvents)
    .leftJoin(teams, eq(posEvents.teamId, teams.id))
    .where(eq(posEvents.id, eventId))
    .limit(1)

  if (!posEvent || !posEvent.event) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
    })
  }

  // Generate print queue entries
  console.log('[print] Generating print queues for order:', order.id)
  const queueIds = await generatePrintQueues({
    orderId: order.id,
    eventId: posEvent.event.id,
    teamId: posEvent.event.teamId,
    orderNumber: order.eventOrderNumber || order.id,
    clientName: order.clientName || undefined,
    orderNotes: order.overallRemarks || undefined,
    teamName: posEvent.team?.name || 'POS',
    eventName: posEvent.event.title,
    isPersonnel: order.isPersonnel || false,
    createdBy: helper.id,
  })
  console.log('[print] Generated', queueIds.length, 'print queue entries:', queueIds)

  // Update helper's last active timestamp
  await db
    .update(posHelpers)
    .set({ lastActiveAt: new Date() })
    .where(eq(posHelpers.id, helper.id))

  return {
    success: true,
    orderId,
    queueIds,
    message: `Generated ${queueIds.length} print queue entries`,
  }
})
