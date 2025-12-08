import { z } from 'zod'

export const posEventSchema = z.object({
  name: z.string().min(1, 'name is required'),
  slug: z.string().min(1, 'slug is required'),
  description: z.string().optional(),
  eventType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.string().min(1, 'status is required'),
  isCurrent: z.boolean().optional(),
  helperPin: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  archivedAt: z.date().optional()
})

export const posEventsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'eventType', header: 'EventType' },
  { accessorKey: 'startDate', header: 'StartDate' },
  { accessorKey: 'endDate', header: 'EndDate' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'isCurrent', header: 'IsCurrent' },
  { accessorKey: 'helperPin', header: 'HelperPin' },
  { accessorKey: 'metadata', header: 'Metadata' },
  { accessorKey: 'archivedAt', header: 'ArchivedAt' }
]

export const posEventsConfig = {
  name: 'posEvents',
  layer: 'pos',
  apiPath: 'pos-events',
  componentName: 'PosEventsForm',
  schema: posEventSchema,
  defaultValues: {
    name: '',
    slug: '',
    description: '',
    eventType: '',
    startDate: null,
    endDate: null,
    status: '',
    isCurrent: false,
    helperPin: '',
    metadata: {},
    archivedAt: null
  },
  columns: posEventsColumns,
}

export const usePosEvents = () => posEventsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posEventsConfig.defaultValues,
    schema: posEventsConfig.schema,
    columns: posEventsConfig.columns,
    collection: posEventsConfig.name
  }
}