// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosOrder, NewPosOrder } from '../../types'
import * as eventsSchema from '../../../events/server/database/schema'
import * as clientsSchema from '../../../clients/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosOrders(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const orders = await db
    .select({
      ...tables.posOrders,
      eventIdData: eventsSchema.posEvents,
      clientIdData: clientsSchema.posClients,
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
    .from(tables.posOrders)
    .leftJoin(eventsSchema.posEvents, eq(tables.posOrders.eventId, eventsSchema.posEvents.id))
    .leftJoin(clientsSchema.posClients, eq(tables.posOrders.clientId, clientsSchema.posClients.id))
    .leftJoin(ownerUsers, eq(tables.posOrders.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posOrders.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posOrders.updatedBy, updatedByUsers.id))
    .where(eq(tables.posOrders.teamId, teamId))
    .orderBy(desc(tables.posOrders.createdAt))

  return orders
}

export async function getPosOrdersByIds(teamId: string, orderIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const orders = await db
    .select({
      ...tables.posOrders,
      eventIdData: eventsSchema.posEvents,
      clientIdData: clientsSchema.posClients,
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
    .from(tables.posOrders)
    .leftJoin(eventsSchema.posEvents, eq(tables.posOrders.eventId, eventsSchema.posEvents.id))
    .leftJoin(clientsSchema.posClients, eq(tables.posOrders.clientId, clientsSchema.posClients.id))
    .leftJoin(ownerUsers, eq(tables.posOrders.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posOrders.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posOrders.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posOrders.teamId, teamId),
        inArray(tables.posOrders.id, orderIds)
      )
    )
    .orderBy(desc(tables.posOrders.createdAt))

  return orders
}

export async function createPosOrder(data: NewPosOrder) {
  const db = useDB()

  const [order] = await db
    .insert(tables.posOrders)
    .values(data)
    .returning()

  return order
}

export async function updatePosOrder(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosOrder>
) {
  const db = useDB()

  const [order] = await db
    .update(tables.posOrders)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posOrders.id, recordId),
        eq(tables.posOrders.teamId, teamId),
        eq(tables.posOrders.owner, ownerId)
      )
    )
    .returning()

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosOrder not found or unauthorized'
    })
  }

  return order
}

export async function deletePosOrder(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posOrders)
    .where(
      and(
        eq(tables.posOrders.id, recordId),
        eq(tables.posOrders.teamId, teamId),
        eq(tables.posOrders.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosOrder not found or unauthorized'
    })
  }

  return { success: true }
}