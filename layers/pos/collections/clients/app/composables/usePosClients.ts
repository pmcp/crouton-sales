import { z } from 'zod'

export const posClientSchema = z.object({
  title: z.string().min(1, 'title is required'),
  isReusable: z.boolean().optional()
})

export const posClientsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'isReusable', header: 'IsReusable' }
]

export const posClientsConfig = {
  name: 'posClients',
  layer: 'pos',
  apiPath: 'pos-clients',
  componentName: 'PosClientsForm',
  schema: posClientSchema,
  defaultValues: {
    title: '',
    isReusable: false
  },
  columns: posClientsColumns,
}

export const usePosClients = () => posClientsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posClientsConfig.defaultValues,
    schema: posClientsConfig.schema,
    columns: posClientsConfig.columns,
    collection: posClientsConfig.name
  }
}