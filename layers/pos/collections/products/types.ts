import type { z } from 'zod'
import type { posProductSchema } from './app/composables/usePosProducts'

export interface PosProduct {
  id: string
  teamId: string
  owner: string
  eventId: string
  categoryId?: string
  locationId?: string
  title: string
  description?: string
  price: number
  isActive?: boolean
  requiresRemark?: boolean
  remarkPrompt?: string
  hasOptions?: boolean
  multipleOptionsAllowed?: boolean
  options?: Record<string, any>
  sortOrder?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosProductFormData = z.infer<typeof posProductSchema>
export type NewPosProduct = Omit<PosProduct, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosProductFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosProduct | Record<string, never> // PosProduct for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}