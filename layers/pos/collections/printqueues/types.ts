import type { z } from 'zod'
import type { posPrintqueueSchema } from './app/composables/usePosPrintqueues'

export interface PosPrintqueue {
  id: string
  teamId: string
  owner: string
  eventId: string
  orderId: string
  printerId: string
  locationId?: string
  status: string
  printData: string
  printMode?: string
  errorMessage?: string
  retryCount?: string
  completedAt?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosPrintqueueFormData = z.infer<typeof posPrintqueueSchema>
export type NewPosPrintqueue = Omit<PosPrintqueue, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosPrintqueueFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosPrintqueue | Record<string, never> // PosPrintqueue for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}