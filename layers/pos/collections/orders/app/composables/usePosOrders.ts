import { z } from 'zod'

export const posOrderSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  eventOrderNumber: z.string().optional(),
  overallRemarks: z.string().optional(),
  isPersonnel: z.boolean().optional(),
  status: z.string().min(1, 'status is required'),
  order: z.number().optional()
})

export const posOrdersColumns = [
  { accessorKey: 'eventOrderNumber', header: 'Order #' },
  { accessorKey: 'clientName', header: 'Client' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'isPersonnel', header: 'Staff' },
  { accessorKey: 'overallRemarks', header: 'Remarks' }
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
    status: '',
    order: 0
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