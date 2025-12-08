// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosEvent, NewPosEvent } from '../../types'
import { users } from '~~/server/database/schema'

export async function getAllPosEvents(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const events = await db
    .select({
      ...tables.posEvents,
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
    .from(tables.posEvents)
    .leftJoin(ownerUsers, eq(tables.posEvents.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posEvents.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posEvents.updatedBy, updatedByUsers.id))
    .where(eq(tables.posEvents.teamId, teamId))
    .orderBy(desc(tables.posEvents.createdAt))

  return events
}

export async function getPosEventsByIds(teamId: string, eventIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const events = await db
    .select({
      ...tables.posEvents,
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
    .from(tables.posEvents)
    .leftJoin(ownerUsers, eq(tables.posEvents.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posEvents.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posEvents.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posEvents.teamId, teamId),
        inArray(tables.posEvents.id, eventIds)
      )
    )
    .orderBy(desc(tables.posEvents.createdAt))

  return events
}

export async function createPosEvent(data: NewPosEvent) {
  const db = useDB()

  const [event] = await db
    .insert(tables.posEvents)
    .values(data)
    .returning()

  return event
}

export async function updatePosEvent(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosEvent>
) {
  const db = useDB()

  const [event] = await db
    .update(tables.posEvents)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posEvents.id, recordId),
        eq(tables.posEvents.teamId, teamId),
        eq(tables.posEvents.owner, ownerId)
      )
    )
    .returning()

  if (!event) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosEvent not found or unauthorized'
    })
  }

  return event
}

export async function deletePosEvent(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posEvents)
    .where(
      and(
        eq(tables.posEvents.id, recordId),
        eq(tables.posEvents.teamId, teamId),
        eq(tables.posEvents.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosEvent not found or unauthorized'
    })
  }

  return { success: true }
}