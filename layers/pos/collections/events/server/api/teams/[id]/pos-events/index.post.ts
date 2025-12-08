// Team-based endpoint - requires @friendlyinternet/nuxt-crouton package
// The #crouton/team-auth alias is provided by @friendlyinternet/nuxt-crouton
// Install: pnpm add @friendlyinternet/nuxt-crouton
// Config: Add '@friendlyinternet/nuxt-crouton' to extends array in nuxt.config.ts
import { createPosEvent } from '../../../../database/queries'
import { resolveTeamAndCheckMembership } from '#crouton/team-auth'

export default defineEventHandler(async (event) => {
  const { team, user } = await resolveTeamAndCheckMembership(event)

  const body = await readBody(event)

  // Exclude id field to let the database generate it
  const { id, ...dataWithoutId } = body

  // Convert date string to Date object
  if (dataWithoutId.startDate) {
    dataWithoutId.startDate = new Date(dataWithoutId.startDate)
  }
  // Convert date string to Date object
  if (dataWithoutId.endDate) {
    dataWithoutId.endDate = new Date(dataWithoutId.endDate)
  }
  // Convert date string to Date object
  if (dataWithoutId.archivedAt) {
    dataWithoutId.archivedAt = new Date(dataWithoutId.archivedAt)
  }
  return await createPosEvent({
    ...dataWithoutId,
    teamId: team.id,
    owner: user.id,
    createdBy: user.id,
    updatedBy: user.id
  })
})