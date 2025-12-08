// Generated with array reference post-processing support (v2024-10-12)
import { eq, and, desc, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/sqlite-core'
import * as tables from './schema'
import type { PosPrinter, NewPosPrinter } from '../../types'
import * as eventsSchema from '../../../events/server/database/schema'
import * as locationsSchema from '../../../locations/server/database/schema'
import { users } from '~~/server/database/schema'

export async function getAllPosPrinters(teamId: string) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const printers = await db
    .select({
      ...tables.posPrinters,
      eventIdData: eventsSchema.posEvents,
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
    .from(tables.posPrinters)
    .leftJoin(eventsSchema.posEvents, eq(tables.posPrinters.eventId, eventsSchema.posEvents.id))
    .leftJoin(locationsSchema.posLocations, eq(tables.posPrinters.locationId, locationsSchema.posLocations.id))
    .leftJoin(ownerUsers, eq(tables.posPrinters.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posPrinters.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posPrinters.updatedBy, updatedByUsers.id))
    .where(eq(tables.posPrinters.teamId, teamId))
    .orderBy(desc(tables.posPrinters.createdAt))

  return printers
}

export async function getPosPrintersByIds(teamId: string, printerIds: string[]) {
  const db = useDB()

  const ownerUsers = alias(users, 'ownerUsers')
  const createdByUsers = alias(users, 'createdByUsers')
  const updatedByUsers = alias(users, 'updatedByUsers')

  // @ts-expect-error Complex select with joins requires type assertion
  const printers = await db
    .select({
      ...tables.posPrinters,
      eventIdData: eventsSchema.posEvents,
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
    .from(tables.posPrinters)
    .leftJoin(eventsSchema.posEvents, eq(tables.posPrinters.eventId, eventsSchema.posEvents.id))
    .leftJoin(locationsSchema.posLocations, eq(tables.posPrinters.locationId, locationsSchema.posLocations.id))
    .leftJoin(ownerUsers, eq(tables.posPrinters.owner, ownerUsers.id))
    .leftJoin(createdByUsers, eq(tables.posPrinters.createdBy, createdByUsers.id))
    .leftJoin(updatedByUsers, eq(tables.posPrinters.updatedBy, updatedByUsers.id))
    .where(
      and(
        eq(tables.posPrinters.teamId, teamId),
        inArray(tables.posPrinters.id, printerIds)
      )
    )
    .orderBy(desc(tables.posPrinters.createdAt))

  return printers
}

export async function createPosPrinter(data: NewPosPrinter) {
  const db = useDB()

  const [printer] = await db
    .insert(tables.posPrinters)
    .values(data)
    .returning()

  return printer
}

export async function updatePosPrinter(
  recordId: string,
  teamId: string,
  ownerId: string,
  updates: Partial<PosPrinter>
) {
  const db = useDB()

  const [printer] = await db
    .update(tables.posPrinters)
    .set({
      ...updates,
      updatedBy: ownerId
    })
    .where(
      and(
        eq(tables.posPrinters.id, recordId),
        eq(tables.posPrinters.teamId, teamId),
        eq(tables.posPrinters.owner, ownerId)
      )
    )
    .returning()

  if (!printer) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrinter not found or unauthorized'
    })
  }

  return printer
}

export async function deletePosPrinter(
  recordId: string,
  teamId: string,
  ownerId: string
) {
  const db = useDB()

  const [deleted] = await db
    .delete(tables.posPrinters)
    .where(
      and(
        eq(tables.posPrinters.id, recordId),
        eq(tables.posPrinters.teamId, teamId),
        eq(tables.posPrinters.owner, ownerId)
      )
    )
    .returning()

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'PosPrinter not found or unauthorized'
    })
  }

  return { success: true }
}