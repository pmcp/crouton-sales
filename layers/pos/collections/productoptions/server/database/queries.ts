// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosProductOption, NewPosProductOption } from '../../types'
import * as productsSchema from '../../../products/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosProductOptions(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const productoptions = await db
    .select({
      ...tables.posProductoptions,
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
    .from(tables.posProductoptions)
    .leftJoin(productsSchema.posProducts, eq(tables.posProductoptions.productId, productsSchema.posProducts.id))
    .leftJoin(ownerUsers, eq(tables.posProductoptions.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posProductoptions.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posProductoptions.updatedBy, updatedByUsers.id))
    .where(eq(tables.posProductoptions.teamId, teamId))
    .orderBy(desc(tables.posProductoptions.createdAt))

  return productoptions
}

export async function getPosProductOptionsByIds(teamId: string, productoptionIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const productoptions = await db
    .select({
      ...tables.posProductoptions,
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
    .from(tables.posProductoptions)
    .leftJoin(productsSchema.posProducts, eq(tables.posProductoptions.productId, productsSchema.posProducts.id))
    .leftJoin(ownerUsers, eq(tables.posProductoptions.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posProductoptions.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posProductoptions.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posProductoptions.teamId, teamId),
        inArray(tables.posProductoptions.id, productoptionIds)
      )
    )
    .orderBy(desc(tables.posProductoptions.createdAt))

  return productoptions
}

export async function createPosProductOption(data: NewPosProductOption) {
  const db = useDB()

  const [productoption] = await db
    .insert(tables.posProductoptions)
    .values(data)
    .returning()

  return productoption
}

export async function updatePosProductOption(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosProductOption>
) {
  const db = useDB()

  const [productoption] = await db
    .update(tables.posProductoptions)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posProductoptions.id, recordId),
        eq(tables.posProductoptions.teamId, teamId),
        eq(tables.posProductoptions.owner, ownerId)
      )
    )
    .returning()

  if (!productoption) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosProductOption not found or unauthorized'
    })
  }

  return productoption
}

export async function deletePosProductOption(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posProductoptions)
    .where(
      and(
        eq(tables.posProductoptions.id, recordId),
        eq(tables.posProductoptions.teamId, teamId),
        eq(tables.posProductoptions.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosProductOption not found or unauthorized'
    })
  }

  return { success: true }
}