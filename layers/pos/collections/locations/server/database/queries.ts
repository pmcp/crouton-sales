// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosLocation, NewPosLocation } from '../../types'
import * as eventsSchema from '../../../events/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosLocations(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const locations = await db
    .select({
      ...tables.posLocations,
      eventIdData: eventsSchema.posEvents,
      ownerUser: {
        id: ownerUsers.id,
        name: ownerUsers.name,
        email: ownerUsers.email,
        avatarUrl: ownerUsers.avatarUrl
      },
      createdByUser: {
        id: createdByUsers.id,
        name: createdByUsers.name,
        email: createdByUsers.email,
        avatarUrl: createdByUsers.avatarUrl
      },
      updatedByUser: {
        id: updatedByUsers.id,
        name: updatedByUsers.name,
        email: updatedByUsers.email,
        avatarUrl: updatedByUsers.avatarUrl
      }
    })
    .from(tables.posLocations)
    .leftJoin(eventsSchema.posEvents, eq(tables.posLocations.eventId, eventsSchema.posEvents.id))
    .leftJoin(ownerUsers, eq(tables.posLocations.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posLocations.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posLocations.updatedBy, updatedByUsers.id))
    .where(eq(tables.posLocations.teamId, teamId))
    .orderBy(desc(tables.posLocations.createdAt))

  return locations
}

export async function getPosLocationsByIds(teamId: string, locationIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const locations = await db
    .select({
      ...tables.posLocations,
      eventIdData: eventsSchema.posEvents,
      ownerUser: {
        id: ownerUsers.id,
        name: ownerUsers.name,
        email: ownerUsers.email,
        avatarUrl: ownerUsers.avatarUrl
      },
      createdByUser: {
        id: createdByUsers.id,
        name: createdByUsers.name,
        email: createdByUsers.email,
        avatarUrl: createdByUsers.avatarUrl
      },
      updatedByUser: {
        id: updatedByUsers.id,
        name: updatedByUsers.name,
        email: updatedByUsers.email,
        avatarUrl: updatedByUsers.avatarUrl
      }
    })
    .from(tables.posLocations)
    .leftJoin(eventsSchema.posEvents, eq(tables.posLocations.eventId, eventsSchema.posEvents.id))
    .leftJoin(ownerUsers, eq(tables.posLocations.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posLocations.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posLocations.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posLocations.teamId, teamId),
        inArray(tables.posLocations.id, locationIds)
      )
    )
    .orderBy(desc(tables.posLocations.createdAt))

  return locations
}

export async function createPosLocation(data: NewPosLocation) {
  const db = useDB()

  const [location] = await db
    .insert(tables.posLocations)
    .values(data)
    .returning()

  return location
}

export async function updatePosLocation(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosLocation>
) {
  const db = useDB()

  const [location] = await db
    .update(tables.posLocations)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posLocations.id, recordId),
        eq(tables.posLocations.teamId, teamId),
        eq(tables.posLocations.owner, ownerId)
      )
    )
    .returning()

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosLocation not found or unauthorized'
    })
  }

  return location
}

export async function deletePosLocation(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posLocations)
    .where(
      and(
        eq(tables.posLocations.id, recordId),
        eq(tables.posLocations.teamId, teamId),
        eq(tables.posLocations.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosLocation not found or unauthorized'
    })
  }

  return { success: true }
}