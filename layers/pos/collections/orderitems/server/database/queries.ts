// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosOrderItem, NewPosOrderItem } from '../../types'
import * as ordersSchema from '../../../orders/server/database/schema'
import * as productsSchema from '../../../products/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosOrderItems(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const orderitems = await db
    .select({
      ...tables.posOrderitems,
      orderIdData: ordersSchema.posOrders,
      productIdData: productsSchema.posProducts,
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
    .from(tables.posOrderitems)
    .leftJoin(ordersSchema.posOrders, eq(tables.posOrderitems.orderId, ordersSchema.posOrders.id))
    .leftJoin(productsSchema.posProducts, eq(tables.posOrderitems.productId, productsSchema.posProducts.id))
    .leftJoin(ownerUsers, eq(tables.posOrderitems.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posOrderitems.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posOrderitems.updatedBy, updatedByUsers.id))
    .where(eq(tables.posOrderitems.teamId, teamId))
    .orderBy(desc(tables.posOrderitems.createdAt))

  return orderitems
}

export async function getPosOrderItemsByIds(teamId: string, orderitemIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const orderitems = await db
    .select({
      ...tables.posOrderitems,
      orderIdData: ordersSchema.posOrders,
      productIdData: productsSchema.posProducts,
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
    .from(tables.posOrderitems)
    .leftJoin(ordersSchema.posOrders, eq(tables.posOrderitems.orderId, ordersSchema.posOrders.id))
    .leftJoin(productsSchema.posProducts, eq(tables.posOrderitems.productId, productsSchema.posProducts.id))
    .leftJoin(ownerUsers, eq(tables.posOrderitems.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posOrderitems.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posOrderitems.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posOrderitems.teamId, teamId),
        inArray(tables.posOrderitems.id, orderitemIds)
      )
    )
    .orderBy(desc(tables.posOrderitems.createdAt))

  return orderitems
}

export async function createPosOrderItem(data: NewPosOrderItem) {
  const db = useDB()

  const [orderitem] = await db
    .insert(tables.posOrderitems)
    .values(data)
    .returning()

  return orderitem
}

export async function updatePosOrderItem(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosOrderItem>
) {
  const db = useDB()

  const [orderitem] = await db
    .update(tables.posOrderitems)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posOrderitems.id, recordId),
        eq(tables.posOrderitems.teamId, teamId),
        eq(tables.posOrderitems.owner, ownerId)
      )
    )
    .returning()

  if (!orderitem) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosOrderItem not found or unauthorized'
    })
  }

  return orderitem
}

export async function deletePosOrderItem(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posOrderitems)
    .where(
      and(
        eq(tables.posOrderitems.id, recordId),
        eq(tables.posOrderitems.teamId, teamId),
        eq(tables.posOrderitems.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosOrderItem not found or unauthorized'
    })
  }

  return { success: true }
}