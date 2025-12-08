import { z } from 'zod'

export const posHelperSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  title: z.string().min(1, 'title is required'),
  token: z.string().min(1, 'token is required'),
  isActive: z.boolean().optional(),
  expiresAt: z.date().optional(),
  lastActiveAt: z.date().optional()
})

export const posHelpersColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'token', header: 'Token' },
  { accessorKey: 'isActive', header: 'IsActive' },
  { accessorKey: 'expiresAt', header: 'ExpiresAt' },
  { accessorKey: 'lastActiveAt', header: 'LastActiveAt' }
]

export const posHelpersConfig = {
  name: 'posHelpers',
  layer: 'pos',
  apiPath: 'pos-helpers',
  componentName: 'PosHelpersForm',
  schema: posHelperSchema,
  defaultValues: {
    eventId: '',
    title: '',
    token: '',
    isActive: false,
    expiresAt: null,
    lastActiveAt: null
  },
  columns: posHelpersColumns,
}

export const usePosHelpers = () => posHelpersConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posHelpersConfig.defaultValues,
    schema: posHelpersConfig.schema,
    columns: posHelpersConfig.columns,
    collection: posHelpersConfig.name
  }
}