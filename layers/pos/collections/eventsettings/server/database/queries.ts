// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosEventSetting, NewPosEventSetting } from '../../types'
import * as eventsSchema from '../../../events/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosEventSettings(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const eventsettings = await db
    .select({
      ...tables.posEventsettings,
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
    .from(tables.posEventsettings)
    .leftJoin(eventsSchema.posEvents, eq(tables.posEventsettings.eventId, eventsSchema.posEvents.id))
    .leftJoin(ownerUsers, eq(tables.posEventsettings.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posEventsettings.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posEventsettings.updatedBy, updatedByUsers.id))
    .where(eq(tables.posEventsettings.teamId, teamId))
    .orderBy(desc(tables.posEventsettings.createdAt))

  return eventsettings
}

export async function getPosEventSettingsByIds(teamId: string, eventsettingIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const eventsettings = await db
    .select({
      ...tables.posEventsettings,
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
    .from(tables.posEventsettings)
    .leftJoin(eventsSchema.posEvents, eq(tables.posEventsettings.eventId, eventsSchema.posEvents.id))
    .leftJoin(ownerUsers, eq(tables.posEventsettings.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posEventsettings.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posEventsettings.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posEventsettings.teamId, teamId),
        inArray(tables.posEventsettings.id, eventsettingIds)
      )
    )
    .orderBy(desc(tables.posEventsettings.createdAt))

  return eventsettings
}

export async function createPosEventSetting(data: NewPosEventSetting) {
  const db = useDB()

  const [eventsetting] = await db
    .insert(tables.posEventsettings)
    .values(data)
    .returning()

  return eventsetting
}

export async function updatePosEventSetting(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosEventSetting>
) {
  const db = useDB()

  const [eventsetting] = await db
    .update(tables.posEventsettings)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posEventsettings.id, recordId),
        eq(tables.posEventsettings.teamId, teamId),
        eq(tables.posEventsettings.owner, ownerId)
      )
    )
    .returning()

  if (!eventsetting) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosEventSetting not found or unauthorized'
    })
  }

  return eventsetting
}

export async function deletePosEventSetting(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posEventsettings)
    .where(
      and(
        eq(tables.posEventsettings.id, recordId),
        eq(tables.posEventsettings.teamId, teamId),
        eq(tables.posEventsettings.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosEventSetting not found or unauthorized'
    })
  }

  return { success: true }
}