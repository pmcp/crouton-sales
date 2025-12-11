import { retryPrintJob } from '~~/layers/pos/server/utils/print-queue-service'
import { validatePrintServerApiKey } from '~~/server/utils/print-server-auth'

// Print server endpoint to retry a failed job
export default defineEventHandler(async (event) => {
  // Validate API key
  validatePrintServerApiKey(event)

  const jobId = getRouterParam(event, 'jobId')

  if (!jobId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job ID is required',
    })
  }

  const job = await retryPrintJob(jobId, 'print-server')

  return {
    success: true,
    job: {
      id: job.id,
      status: job.status,
      retryCount: job.retryCount,
    },
  }
})
