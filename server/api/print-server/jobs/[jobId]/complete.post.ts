import { markJobCompleted } from '~~/layers/pos/server/utils/print-queue-service'
import { validatePrintServerApiKey } from '~~/server/utils/print-server-auth'

// Print server endpoint to mark a job as completed
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

  const job = await markJobCompleted(jobId, 'print-server')

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Print job not found',
    })
  }

  return {
    success: true,
    job: {
      id: job.id,
      status: job.status,
      completedAt: job.completedAt,
    },
  }
})
