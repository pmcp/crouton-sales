import { getPendingPrintJobs, markJobPrinting } from '~~/layers/pos/server/utils/print-queue-service'
import { validatePrintServerApiKey } from '~~/server/utils/print-server-auth'

// Print server endpoint to poll for pending jobs
// Authenticated via API key in X-API-Key header
export default defineEventHandler(async (event) => {
  console.log('[print-server] GET /jobs called')

  // Validate API key
  validatePrintServerApiKey(event)

  const eventId = getRouterParam(event, 'eventId')
  console.log('[print-server] eventId:', eventId)

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  // Get query params for marking jobs as printing
  const query = getQuery(event)
  const markAsPrinting = query.mark_as_printing === 'true'

  // Get pending print jobs for this event
  const jobs = await getPendingPrintJobs(eventId)
  console.log('[print-server] Found', jobs.length, 'pending jobs')

  // If requested, mark fetched jobs as printing
  if (markAsPrinting && jobs.length > 0) {
    const systemUser = 'print-server'
    await Promise.all(
      jobs.map(job => markJobPrinting(job.id, systemUser))
    )
  }

  // Return jobs in format expected by fyit-pos-printer
  return {
    jobs: jobs.map(job => ({
      id: job.id,
      orderId: job.orderId,
      printerId: job.printerId,
      printerIp: job.printerIp,
      printerPort: job.printerPort ? parseInt(job.printerPort, 10) : 9100,
      printerName: job.printerTitle,
      locationId: job.locationId,
      printMode: job.printMode,
      printData: job.printData,
      retryCount: job.retryCount,
      createdAt: job.createdAt,
    })),
  }
})
