import type { z } from 'zod'
import type { posOrderSchema } from './app/composables/usePosOrders'

export interface PosOrder {
  id: string
  teamId: string
  owner: string
  eventId: string
  clientId?: string
  clientName?: string
  eventOrderNumber?: string
  overallRemarks?: string
  isPersonnel?: boolean
  status: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosOrderFormData = z.infer<typeof posOrderSchema>
export type NewPosOrder = Omit<PosOrder, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosOrderFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosOrder | Record<string, never> // PosOrder for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}