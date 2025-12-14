import { eq, and } from 'drizzle-orm'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'
import { posEventsettings } from '../../../../../database/schema'

export interface ReceiptSettings {
  items_section_title: string
  special_instructions_title: string
  complete_order_header: string
  staff_order_header: string
  footer_text: string
  test_title: string
  test_success_message: string
}

const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  items_section_title: 'ITEMS:',
  special_instructions_title: 'SPECIAL INSTRUCTIONS:',
  complete_order_header: '*** COMPLETE ORDER ***',
  staff_order_header: '*** STAFF ORDER ***',
  footer_text: 'Thank you for your order!',
  test_title: 'PRINTER TEST',
  test_success_message: 'Test completed successfully!'
}

export default defineEventHandler(async (event) => {
  const { team } = await resolveTeamAndCheckMembership(event)
  const eventId = getRouterParam(event, 'eventId')

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required'
    })
  }

  const db = useDB()

  // Look for existing receipt_settings entry
  const [existing] = await db
    .select()
    .from(posEventsettings)
    .where(
      and(
        eq(posEventsettings.teamId, team.id),
        eq(posEventsettings.eventId, eventId),
        eq(posEventsettings.settingKey, 'receipt_settings')
      )
    )

  if (existing?.settingValue) {
    try {
      return JSON.parse(existing.settingValue) as ReceiptSettings
    } catch {
      // If JSON is invalid, return defaults
      return DEFAULT_RECEIPT_SETTINGS
    }
  }

  // Return defaults if no setting exists
  return DEFAULT_RECEIPT_SETTINGS
})
