import { z } from 'zod'

export const posLocationSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  title: z.string().min(1, 'title is required')
})

export const posLocationsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'title', header: 'Title' }
]

export const posLocationsConfig = {
  name: 'posLocations',
  layer: 'pos',
  apiPath: 'pos-locations',
  componentName: 'PosLocationsForm',
  schema: posLocationSchema,
  defaultValues: {
    eventId: '',
    title: ''
  },
  columns: posLocationsColumns,
}

export const usePosLocations = () => posLocationsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posLocationsConfig.defaultValues,
    schema: posLocationsConfig.schema,
    columns: posLocationsConfig.columns,
    collection: posLocationsConfig.name
  }
}