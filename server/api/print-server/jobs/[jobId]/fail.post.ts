import { markJobFailed } from '~~/layers/pos/server/utils/print-queue-service'
import { validatePrintServerApiKey } from '~~/server/utils/print-server-auth'

interface FailJobBody {
  errorMessage?: string
}

// Print server endpoint to mark a job as failed
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

  const body = await readBody<FailJobBody>(event)
  const errorMessage = body?.errorMessage || 'Unknown error'

  const job = await markJobFailed(jobId, errorMessage, 'print-server')

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
      errorMessage: job.errorMessage,
    },
  }
})
