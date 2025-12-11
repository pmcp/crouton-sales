import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, real, customType } from 'drizzle-orm/sqlite-core'

// Custom JSON column that handles NULL values gracefully during LEFT JOINs
const jsonColumn = customType<any>({
  dataType() {
    return 'text'
  },
  fromDriver(value: unknown): any {
    if (value === null || value === undefined || value === '') {
      return null
    }
    return JSON.parse(value as string)
  },
  toDriver(value: any): string {
    return JSON.stringify(value)
  },
})

export const posPrintqueues = sqliteTable('pos_printqueues', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('teamId').notNull(),
  owner: text('owner').notNull(),
  eventId: text('eventId').notNull(),
  orderId: text('orderId').notNull(),
  printerId: text('printerId').notNull(),
  locationId: text('locationId'),
  status: integer('status').notNull().$default(() => 0),
  printData: text('printData').notNull(),
  printMode: text('printMode').$default(() => 'kitchen'),
  errorMessage: text('errorMessage'),
  retryCount: integer('retryCount').$default(() => 0),
  completedAt: integer('completedAt', { mode: 'timestamp' }),

  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date()),
  createdBy: text('createdBy').notNull(),
  updatedBy: text('updatedBy').notNull()
})