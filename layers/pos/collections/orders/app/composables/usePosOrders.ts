import { z } from 'zod'

export const posOrderSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  eventOrderNumber: z.string().optional(),
  overallRemarks: z.string().optional(),
  isPersonnel: z.boolean().optional(),
  status: z.string().min(1, 'status is required')
})

export const posOrdersColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'clientId', header: 'ClientId' },
  { accessorKey: 'clientName', header: 'ClientName' },
  { accessorKey: 'eventOrderNumber', header: 'EventOrderNumber' },
  { accessorKey: 'overallRemarks', header: 'OverallRemarks' },
  { accessorKey: 'isPersonnel', header: 'IsPersonnel' },
  { accessorKey: 'status', header: 'Status' }
]

export const posOrdersConfig = {
  name: 'posOrders',
  layer: 'pos',
  apiPath: 'pos-orders',
  componentName: 'PosOrdersForm',
  schema: posOrderSchema,
  defaultValues: {
    eventId: '',
    clientId: '',
    clientName: '',
    eventOrderNumber: '',
    overallRemarks: '',
    isPersonnel: false,
    status: ''
  },
  columns: posOrdersColumns,
}

export const usePosOrders = () => posOrdersConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posOrdersConfig.defaultValues,
    schema: posOrdersConfig.schema,
    columns: posOrdersConfig.columns,
    collection: posOrdersConfig.name
  }
}