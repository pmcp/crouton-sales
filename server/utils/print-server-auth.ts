import type { H3Event } from 'h3'

/**
 * Validate API key for print server authentication
 * The API key should be passed in the X-API-Key header
 * Set the key via PRINT_SERVER_API_KEY environment variable
 */
export function validatePrintServerApiKey(event: H3Event): void {
  const apiKey = getHeader(event, 'x-api-key')
  const expectedKey = useRuntimeConfig().printServerApiKey

  if (!expectedKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Print server API key not configured',
    })
  }

  if (!apiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'API key required',
    })
  }

  if (apiKey !== expectedKey) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid API key',
    })
  }
}
