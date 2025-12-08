import type { z } from 'zod'
import type { posPrinterSchema } from './app/composables/usePosPrinters'

export interface PosPrinter {
  id: string
  teamId: string
  owner: string
  eventId: string
  locationId: string
  name: string
  ipAddress: string
  port?: string
  status?: string
  showPrices?: boolean
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosPrinterFormData = z.infer<typeof posPrinterSchema>
export type NewPosPrinter = Omit<PosPrinter, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosPrinterFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosPrinter | Record<string, never> // PosPrinter for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}