import { eq, and, gt } from 'drizzle-orm'
import { posEvents } from '~~/layers/pos/collections/events/server/database/schema'
import { posHelpers } from '~~/layers/pos/collections/helpers/server/database/schema'
import { posOrders } from '~~/layers/pos/collections/orders/server/database/schema'
import { teams } from '~~/server/database/schema'
import { generatePrintQueues } from '~~/layers/pos/server/utils/print-queue-service'

// Helper-authenticated endpoint to trigger print queue generation for an order
export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'eventId')
  const orderId = getRouterParam(event, 'orderId')

  if (!eventId || !orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID and Order ID are required',
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

  // Get the order
  const [order] = await db
    .select()
    .from(posOrders)
    .where(
      and(
        eq(posOrders.id, orderId),
        eq(posOrders.eventId, eventId)
      )
    )
    .limit(1)

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found',
    })
  }

  // Generate print queue entries
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
