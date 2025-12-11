import { z } from 'zod'

export const posPrintqueueSchema = z.object({
  teamId: z.string().min(1, 'teamId is required'),
  owner: z.string().min(1, 'owner is required'),
  eventId: z.string().min(1, 'eventId is required'),
  orderId: z.string().min(1, 'orderId is required'),
  printerId: z.string().min(1, 'printerId is required'),
  locationId: z.string().optional(),
  status: z.string().min(1, 'status is required'),
  printData: z.string().min(1, 'printData is required'),
  printMode: z.string().optional(),
  errorMessage: z.string().optional(),
  retryCount: z.string().optional(),
  completedAt: z.string().optional()
})

export const posPrintqueuesColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'teamId', header: 'TeamId' },
  { accessorKey: 'owner', header: 'Owner' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'orderId', header: 'OrderId' },
  { accessorKey: 'printerId', header: 'PrinterId' },
  { accessorKey: 'locationId', header: 'LocationId' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'printData', header: 'PrintData' },
  { accessorKey: 'printMode', header: 'PrintMode' },
  { accessorKey: 'errorMessage', header: 'ErrorMessage' },
  { accessorKey: 'retryCount', header: 'RetryCount' },
  { accessorKey: 'completedAt', header: 'CompletedAt' }
]

export const posPrintqueuesConfig = {
  name: 'posPrintqueues',
  layer: 'pos',
  apiPath: 'pos-printqueues',
  componentName: 'PosPrintqueuesForm',
  schema: posPrintqueueSchema,
  defaultValues: {
    teamId: '',
    owner: '',
    eventId: '',
    orderId: '',
    printerId: '',
    locationId: '',
    status: '',
    printData: '',
    printMode: '',
    errorMessage: '',
    retryCount: '',
    completedAt: ''
  },
  columns: posPrintqueuesColumns,
}

export const usePosPrintqueues = () => posPrintqueuesConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posPrintqueuesConfig.defaultValues,
    schema: posPrintqueuesConfig.schema,
    columns: posPrintqueuesConfig.columns,
    collection: posPrintqueuesConfig.name
  }
}