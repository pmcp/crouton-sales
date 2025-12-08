// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosCategorie, NewPosCategorie } from '../../types'
import * as eventsSchema from '../../../events/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosCategories(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const categories = await db
    .select({
      ...tables.posCategories,
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
    .from(tables.posCategories)
    .leftJoin(eventsSchema.posEvents, eq(tables.posCategories.eventId, eventsSchema.posEvents.id))
    .leftJoin(ownerUsers, eq(tables.posCategories.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posCategories.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posCategories.updatedBy, updatedByUsers.id))
    .where(eq(tables.posCategories.teamId, teamId))
    .orderBy(desc(tables.posCategories.createdAt))

  return categories
}

export async function getPosCategoriesByIds(teamId: string, categorieIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const categories = await db
    .select({
      ...tables.posCategories,
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
    .from(tables.posCategories)
    .leftJoin(eventsSchema.posEvents, eq(tables.posCategories.eventId, eventsSchema.posEvents.id))
    .leftJoin(ownerUsers, eq(tables.posCategories.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posCategories.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posCategories.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posCategories.teamId, teamId),
        inArray(tables.posCategories.id, categorieIds)
      )
    )
    .orderBy(desc(tables.posCategories.createdAt))

  return categories
}

export async function createPosCategorie(data: NewPosCategorie) {
  const db = useDB()

  const [categorie] = await db
    .insert(tables.posCategories)
    .values(data)
    .returning()

  return categorie
}

export async function updatePosCategorie(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosCategorie>
) {
  const db = useDB()

  const [categorie] = await db
    .update(tables.posCategories)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posCategories.id, recordId),
        eq(tables.posCategories.teamId, teamId),
        eq(tables.posCategories.owner, ownerId)
      )
    )
    .returning()

  if (!categorie) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosCategorie not found or unauthorized'
    })
  }

  return categorie
}

export async function deletePosCategorie(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posCategories)
    .where(
      and(
        eq(tables.posCategories.id, recordId),
        eq(tables.posCategories.teamId, teamId),
        eq(tables.posCategories.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosCategorie not found or unauthorized'
    })
  }

  return { success: true }
}