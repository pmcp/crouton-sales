import { z } from 'zod'

export const posClientSchema = z.object({
  name: z.string().min(1, 'name is required'),
  isReusable: z.boolean().optional()
})

export const posClientsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'isReusable', header: 'IsReusable' }
]

export const posClientsConfig = {
  name: 'posClients',
  layer: 'pos',
  apiPath: 'pos-clients',
  componentName: 'PosClientsForm',
  schema: posClientSchema,
  defaultValues: {
    name: '',
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