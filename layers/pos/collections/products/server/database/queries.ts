// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, asc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosProduct, NewPosProduct } from '../../types'
import * as eventsSchema from '../../../events/server/database/schema'
import * as categoriesSchema from '../../../categories/server/database/schema'
import * as locationsSchema from '../../../locations/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosProducts(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const products = await db
    .select({
      ...tables.posProducts,
      eventIdData: eventsSchema.posEvents,
      categoryIdData: categoriesSchema.posCategories,
      locationIdData: locationsSchema.posLocations,
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
    .from(tables.posProducts)
    .leftJoin(eventsSchema.posEvents, eq(tables.posProducts.eventId, eventsSchema.posEvents.id))
    .leftJoin(categoriesSchema.posCategories, eq(tables.posProducts.categoryId, categoriesSchema.posCategories.id))
    .leftJoin(locationsSchema.posLocations, eq(tables.posProducts.locationId, locationsSchema.posLocations.id))
    .leftJoin(ownerUsers, eq(tables.posProducts.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posProducts.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posProducts.updatedBy, updatedByUsers.id))
    .where(eq(tables.posProducts.teamId, teamId))
    .orderBy(asc(tables.posProducts.order), desc(tables.posProducts.createdAt))

  return products
}

export async function getPosProductsByIds(teamId: string, productIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const products = await db
    .select({
      ...tables.posProducts,
      eventIdData: eventsSchema.posEvents,
      categoryIdData: categoriesSchema.posCategories,
      locationIdData: locationsSchema.posLocations,
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
    .from(tables.posProducts)
    .leftJoin(eventsSchema.posEvents, eq(tables.posProducts.eventId, eventsSchema.posEvents.id))
    .leftJoin(categoriesSchema.posCategories, eq(tables.posProducts.categoryId, categoriesSchema.posCategories.id))
    .leftJoin(locationsSchema.posLocations, eq(tables.posProducts.locationId, locationsSchema.posLocations.id))
    .leftJoin(ownerUsers, eq(tables.posProducts.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posProducts.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posProducts.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posProducts.teamId, teamId),
        inArray(tables.posProducts.id, productIds)
      )
    )
    .orderBy(asc(tables.posProducts.order), desc(tables.posProducts.createdAt))

  return products
}

export async function getPosProductsByEventId(teamId: string, eventId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const products = await db
    .select({
      ...tables.posProducts,
      eventIdData: eventsSchema.posEvents,
      categoryIdData: categoriesSchema.posCategories,
      locationIdData: locationsSchema.posLocations,
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
    .from(tables.posProducts)
    .leftJoin(eventsSchema.posEvents, eq(tables.posProducts.eventId, eventsSchema.posEvents.id))
    .leftJoin(categoriesSchema.posCategories, eq(tables.posProducts.categoryId, categoriesSchema.posCategories.id))
    .leftJoin(locationsSchema.posLocations, eq(tables.posProducts.locationId, locationsSchema.posLocations.id))
    .leftJoin(ownerUsers, eq(tables.posProducts.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posProducts.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posProducts.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posProducts.teamId, teamId),
        eq(tables.posProducts.eventId, eventId)
      )
    )
    .orderBy(asc(tables.posProducts.order), desc(tables.posProducts.createdAt))

  return products
}

export async function createPosProduct(data: NewPosProduct) {
  const db = useDB()

  const [product] = await db
    .insert(tables.posProducts)
    .values(data)
    .returning()

  return product
}

export async function updatePosProduct(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosProduct>
) {
  const db = useDB()

  const [product] = await db
    .update(tables.posProducts)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posProducts.id, recordId),
        eq(tables.posProducts.teamId, teamId),
        eq(tables.posProducts.owner, ownerId)
      )
    )
    .returning()

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosProduct not found or unauthorized'
    })
  }

  return product
}

export async function deletePosProduct(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posProducts)
    .where(
      and(
        eq(tables.posProducts.id, recordId),
        eq(tables.posProducts.teamId, teamId),
        eq(tables.posProducts.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosProduct not found or unauthorized'
    })
  }

  return { success: true }
}

export async function reorderPosProducts(
  teamId: string,
  userId: string,
  updates: Array<{ id: string; order: number }>
) {
  const db = useDB()

  const results = await Promise.all(
    updates.map(({ id, order }) =>
      db
        .update(tables.posProducts)
        .set({
          order,
          updatedBy: userId
        })
        .where(
          and(
            eq(tables.posProducts.id, id),
            eq(tables.posProducts.teamId, teamId)
          )
        )
        .returning()
    )
  )

  return { success: true, updated: results.flat().length }
}