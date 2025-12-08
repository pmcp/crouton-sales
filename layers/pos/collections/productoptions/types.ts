import type { z } from 'zod'
import type { posProductOptionSchema } from './app/composables/usePosProductOptions'

export interface PosProductOption {
  id: string
  teamId: string
  owner: string
  productId: string
  optionName: string
  additionalPrice?: number
  displayOrder?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosProductOptionFormData = z.infer<typeof posProductOptionSchema>
export type NewPosProductOption = Omit<PosProductOption, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosProductOptionFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosProductOption | Record<string, never> // PosProductOption for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}