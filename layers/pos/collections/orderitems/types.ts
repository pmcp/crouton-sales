import type { z } from 'zod'
import type { posOrderItemSchema } from './app/composables/usePosOrderItems'

export interface PosOrderItem {
  id: string
  teamId: string
  owner: string
  orderId: string
  productId: string
  quantity: string
  unitPrice: number
  totalPrice: number
  remarks?: string
  selectedOptions?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosOrderItemFormData = z.infer<typeof posOrderItemSchema>
export type NewPosOrderItem = Omit<PosOrderItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosOrderItemFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosOrderItem | Record<string, never> // PosOrderItem for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}