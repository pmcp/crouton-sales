// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosPrintqueue, NewPosPrintqueue } from '../../types'
import { users } from '~~/server/database/schema'

export async function getAllPosPrintqueues(teamId: string) {
  const db = useDB()

  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const printqueues = await db
    .select({
      ...tables.posPrintqueues,
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
    .from(tables.posPrintqueues)
    .leftJoin(createdByUsers, eq(tables.posPrintqueues.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posPrintqueues.updatedBy, updatedByUsers.id))
    .where(eq(tables.posPrintqueues.teamId, teamId))
    .orderBy(desc(tables.posPrintqueues.createdAt))

  return printqueues
}

export async function getPosPrintqueuesByIds(teamId: string, printqueueIds: string[]) {
  const db = useDB()

  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const printqueues = await db
    .select({
      ...tables.posPrintqueues,
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
    .from(tables.posPrintqueues)
    .leftJoin(createdByUsers, eq(tables.posPrintqueues.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posPrintqueues.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posPrintqueues.teamId, teamId),
        inArray(tables.posPrintqueues.id, printqueueIds)
      )
    )
    .orderBy(desc(tables.posPrintqueues.createdAt))

  return printqueues
}

export async function createPosPrintqueue(data: NewPosPrintqueue) {
  const db = useDB()

  const [printqueue] = await db
    .insert(tables.posPrintqueues)
    .values(data)
    .returning()

  return printqueue
}

export async function updatePosPrintqueue(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosPrintqueue>
) {
  const db = useDB()

  const [printqueue] = await db
    .update(tables.posPrintqueues)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posPrintqueues.id, recordId),
        eq(tables.posPrintqueues.teamId, teamId),
        eq(tables.posPrintqueues.owner, ownerId)
      )
    )
    .returning()

  if (!printqueue) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrintqueue not found or unauthorized'
    })
  }

  return printqueue
}

export async function deletePosPrintqueue(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posPrintqueues)
    .where(
      and(
        eq(tables.posPrintqueues.id, recordId),
        eq(tables.posPrintqueues.teamId, teamId),
        eq(tables.posPrintqueues.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrintqueue not found or unauthorized'
    })
  }

  return { success: true }
}