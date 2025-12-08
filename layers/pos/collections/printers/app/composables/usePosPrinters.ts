import { z } from 'zod'

export const posPrinterSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  locationId: z.string().min(1, 'locationId is required'),
  title: z.string().min(1, 'title is required'),
  ipAddress: z.string().min(1, 'ipAddress is required'),
  port: z.string().optional(),
  status: z.string().optional(),
  showPrices: z.boolean().optional(),
  isActive: z.boolean().optional()
})

export const posPrintersColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'locationId', header: 'LocationId' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'ipAddress', header: 'IpAddress' },
  { accessorKey: 'port', header: 'Port' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'showPrices', header: 'ShowPrices' },
  { accessorKey: 'isActive', header: 'IsActive' }
]

export const posPrintersConfig = {
  name: 'posPrinters',
  layer: 'pos',
  apiPath: 'pos-printers',
  componentName: 'PosPrintersForm',
  schema: posPrinterSchema,
  defaultValues: {
    eventId: '',
    locationId: '',
    title: '',
    ipAddress: '',
    port: '',
    status: '',
    showPrices: false,
    isActive: false
  },
  columns: posPrintersColumns,
}

export const usePosPrinters = () => posPrintersConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posPrintersConfig.defaultValues,
    schema: posPrintersConfig.schema,
    columns: posPrintersConfig.columns,
    collection: posPrintersConfig.name
  }
}