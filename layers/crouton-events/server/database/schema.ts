import { nanoid } from 'nanoid'
import { sqliteTable, text, integer, customType } from 'drizzle-orm/sqlite-core'

// Custom JSON column that handles NULL values gracefully during LEFT JOINs
const jsonColumn = customType<{ data: unknown; driverData: string }>({
  dataType() {
    return 'text'
  },
  fromDriver(value: unknown): unknown {
    if (value === null || value === undefined || value === '') {
      return null
    }
    return JSON.parse(value as string)
  },
  toDriver(value: unknown): string {
    return JSON.stringify(value)
  },
})

export const croutonCollectionEvents = sqliteTable('crouton_collection_events', {
  id: text('id').primaryKey().$default(() => nanoid()),

  teamId: text('teamId').notNull(),
  owner: text('owner').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  operation: text('operation').notNull(), // 'create' | 'update' | 'delete'
  collectionName: text('collectionName').notNull(),
  itemId: text('itemId').notNull(),
  userId: text('userId').notNull(),
  userName: text('userName').notNull(),
  changes: jsonColumn('changes').notNull(), // Array of {fieldName, oldValue, newValue}
  metadata: jsonColumn('metadata'),

  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().$default(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().$onUpdate(() => new Date()),
  createdBy: text('createdBy').notNull(),
  updatedBy: text('updatedBy').notNull(),
})
