// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosHelper, NewPosHelper } from '../../types'
import * as eventsSchema from '../../../events/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosHelpers(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const helpers = await db
    .select({
      ...tables.posHelpers,
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
    .from(tables.posHelpers)
    .leftJoin(eventsSchema.posEvents, eq(tables.posHelpers.eventId, eventsSchema.posEvents.id))
    .leftJoin(ownerUsers, eq(tables.posHelpers.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posHelpers.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posHelpers.updatedBy, updatedByUsers.id))
    .where(eq(tables.posHelpers.teamId, teamId))
    .orderBy(desc(tables.posHelpers.createdAt))

  return helpers
}

export async function getPosHelpersByIds(teamId: string, helperIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const helpers = await db
    .select({
      ...tables.posHelpers,
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
    .from(tables.posHelpers)
    .leftJoin(eventsSchema.posEvents, eq(tables.posHelpers.eventId, eventsSchema.posEvents.id))
    .leftJoin(ownerUsers, eq(tables.posHelpers.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posHelpers.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posHelpers.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posHelpers.teamId, teamId),
        inArray(tables.posHelpers.id, helperIds)
      )
    )
    .orderBy(desc(tables.posHelpers.createdAt))

  return helpers
}

export async function createPosHelper(data: NewPosHelper) {
  const db = useDB()

  const [helper] = await db
    .insert(tables.posHelpers)
    .values(data)
    .returning()

  return helper
}

export async function updatePosHelper(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosHelper>
) {
  const db = useDB()

  const [helper] = await db
    .update(tables.posHelpers)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posHelpers.id, recordId),
        eq(tables.posHelpers.teamId, teamId),
        eq(tables.posHelpers.owner, ownerId)
      )
    )
    .returning()

  if (!helper) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosHelper not found or unauthorized'
    })
  }

  return helper
}

export async function deletePosHelper(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posHelpers)
    .where(
      and(
        eq(tables.posHelpers.id, recordId),
        eq(tables.posHelpers.teamId, teamId),
        eq(tables.posHelpers.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosHelper not found or unauthorized'
    })
  }

  return { success: true }
}