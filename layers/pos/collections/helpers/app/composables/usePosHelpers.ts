import { z } from 'zod'

export const posHelperSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  name: z.string().min(1, 'name is required'),
  token: z.string().min(1, 'token is required'),
  isActive: z.boolean().optional(),
  expiresAt: z.date().optional(),
  lastActiveAt: z.date().optional()
})

export const posHelpersColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'name', header: 'Name' },
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
    name: '',
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