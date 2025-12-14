import { eq, and } from 'drizzle-orm'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import { posPrinters } from '~~/layers/pos/collections/printers/server/database/schema'
import { posPrintqueues } from '~~/layers/pos/collections/printqueues/server/database/schema'
import { posEventsettings } from '~~/layers/pos/collections/eventsettings/server/database/schema'
import { formatTestReceipt, DEFAULT_RECEIPT_SETTINGS } from '~~/layers/pos/server/utils/receipt-formatter'
import { PRINT_STATUS } from '~~/layers/pos/server/utils/print-queue-service'

export default defineEventHandler(async (event) => {
  const { team, user } = await resolveTeamAndCheckMembership(event)
  const printerId = getRouterParam(event, 'printerId')

  if (!printerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Printer ID is required'
    })
  }

  const db = useDB()

  // Get printer details
  const [printer] = await db
    .select()
    .from(posPrinters)
    .where(
      and(
        eq(posPrinters.id, printerId),
        eq(posPrinters.teamId, team.id)
      )
    )

  if (!printer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Printer not found'
    })
  }

  // Get receipt settings for this event
  let receiptSettings = { ...DEFAULT_RECEIPT_SETTINGS }

  const [settingsRow] = await db
    .select()
    .from(posEventsettings)
    .where(
      and(
        eq(posEventsettings.teamId, team.id),
        eq(posEventsettings.eventId, printer.eventId),
        eq(posEventsettings.settingKey, 'receipt_settings')
      )
    )

  if (settingsRow?.settingValue) {
    try {
      receiptSettings = JSON.parse(settingsRow.settingValue)
    } catch {
      // Use defaults if JSON parsing fails
    }
  }

  // Format test receipt with custom settings
  const formattedReceipt = formatTestReceipt(
    printer.title,
    `${printer.ipAddress}:${printer.port || '9100'}`,
    receiptSettings
  )

  // Create print queue entry
  const result = await db
    .insert(posPrintqueues)
    .values({
      teamId: team.id,
      owner: user.id,
      eventId: printer.eventId,
      orderId: `test-${Date.now()}`,
      printerId: printer.id,
      locationId: printer.locationId || null,
      status: PRINT_STATUS.PENDING,
      printData: formattedReceipt.base64,
      printMode: 'test',
      retryCount: 0,
      createdBy: user.id,
      updatedBy: user.id
    })
    .returning()

  const queueEntry = result[0]
  if (!queueEntry) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create print queue entry'
    })
  }

  return {
    success: true,
    queueId: queueEntry.id,
    message: 'Test print job queued'
  }
})
