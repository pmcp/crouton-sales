// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosClient, NewPosClient } from '../../types'
import { users } from '~~/server/database/schema'

export async function getAllPosClients(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const clients = await db
    .select({
      ...tables.posClients,
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
    .from(tables.posClients)
    .leftJoin(ownerUsers, eq(tables.posClients.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posClients.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posClients.updatedBy, updatedByUsers.id))
    .where(eq(tables.posClients.teamId, teamId))
    .orderBy(desc(tables.posClients.createdAt))

  return clients
}

export async function getPosClientsByIds(teamId: string, clientIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const clients = await db
    .select({
      ...tables.posClients,
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
    .from(tables.posClients)
    .leftJoin(ownerUsers, eq(tables.posClients.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posClients.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posClients.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posClients.teamId, teamId),
        inArray(tables.posClients.id, clientIds)
      )
    )
    .orderBy(desc(tables.posClients.createdAt))

  return clients
}

export async function createPosClient(data: NewPosClient) {
  const db = useDB()

  const [client] = await db
    .insert(tables.posClients)
    .values(data)
    .returning()

  return client
}

export async function updatePosClient(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosClient>
) {
  const db = useDB()

  const [client] = await db
    .update(tables.posClients)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posClients.id, recordId),
        eq(tables.posClients.teamId, teamId),
        eq(tables.posClients.owner, ownerId)
      )
    )
    .returning()

  if (!client) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosClient not found or unauthorized'
    })
  }

  return client
}

export async function deletePosClient(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posClients)
    .where(
      and(
        eq(tables.posClients.id, recordId),
        eq(tables.posClients.teamId, teamId),
        eq(tables.posClients.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosClient not found or unauthorized'
    })
  }

  return { success: true }
}