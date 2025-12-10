import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { CroutonCollectionEvent, NewCroutonCollectionEvent } from '../../types'
import { users } from '~~/server/database/schema'

export async function getAllCroutonCollectionEvents(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const events = await db
    .select({
      ...tables.croutonCollectionEvents,
      ownerUser: {
        id: ownerUsers.id,
        name: ownerUsers.name,
        email: ownerUsers.email,
        avatarUrl: ownerUsers.avatarUrl,
      },
      createdByUser: {
        id: createdByUsers.id,
        name: createdByUsers.name,
        email: createdByUsers.email,
        avatarUrl: createdByUsers.avatarUrl,
      },
      updatedByUser: {
        id: updatedByUsers.id,
        name: updatedByUsers.name,
        email: updatedByUsers.email,
        avatarUrl: updatedByUsers.avatarUrl,
      },
    })
    .from(tables.croutonCollectionEvents)
    .leftJoin(ownerUsers, eq(tables.croutonCollectionEvents.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.croutonCollectionEvents.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.croutonCollectionEvents.updatedBy, updatedByUsers.id))
    .where(eq(tables.croutonCollectionEvents.teamId, teamId))
    .orderBy(desc(tables.croutonCollectionEvents.timestamp))

  return events
}

export async function getCroutonCollectionEventsByIds(teamId: string, eventIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const events = await db
    .select({
      ...tables.croutonCollectionEvents,
      ownerUser: {
        id: ownerUsers.id,
        name: ownerUsers.name,
        email: ownerUsers.email,
        avatarUrl: ownerUsers.avatarUrl,
      },
      createdByUser: {
        id: createdByUsers.id,
        name: createdByUsers.name,
        email: createdByUsers.email,
        avatarUrl: createdByUsers.avatarUrl,
      },
      updatedByUser: {
        id: updatedByUsers.id,
        name: updatedByUsers.name,
        email: updatedByUsers.email,
        avatarUrl: updatedByUsers.avatarUrl,
      },
    })
    .from(tables.croutonCollectionEvents)
    .leftJoin(ownerUsers, eq(tables.croutonCollectionEvents.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.croutonCollectionEvents.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.croutonCollectionEvents.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.croutonCollectionEvents.teamId, teamId),
        inArray(tables.croutonCollectionEvents.id, eventIds),
      ),
    )
    .orderBy(desc(tables.croutonCollectionEvents.timestamp))

  return events
}

export async function createCroutonCollectionEvent(data: NewCroutonCollectionEvent) {
  const db = useDB()

  const [event] = await db
    .insert(tables.croutonCollectionEvents)
    .values(data)
    .returning()

  return event
}

export async function updateCroutonCollectionEvent(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<CroutonCollectionEvent>,
) {
  const db = useDB()

  const [event] = await db
    .update(tables.croutonCollectionEvents)
    .set({
      ...updates,
      updatedBy: ownerId,
    })
    .where(
      and(
        eq(tables.croutonCollectionEvents.id, recordId),
        eq(tables.croutonCollectionEvents.teamId, teamId),
        eq(tables.croutonCollectionEvents.owner, ownerId),
      ),
    )
    .returning()

  if (!event) {
    throw createError({
      statusCode: 404,
      statusMessage: 'CroutonCollectionEvent not found or unauthorized',
    })
  }

  return event
}

export async function deleteCroutonCollectionEvent(
  recordId: string,
  teamId: string,
  ownerId: string,
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.croutonCollectionEvents)
    .where(
      and(
        eq(tables.croutonCollectionEvents.id, recordId),
        eq(tables.croutonCollectionEvents.teamId, teamId),
        eq(tables.croutonCollectionEvents.owner, ownerId),
      ),
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'CroutonCollectionEvent not found or unauthorized',
    })
  }

  return { success: true }
}
