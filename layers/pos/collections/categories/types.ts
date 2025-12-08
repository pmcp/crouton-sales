import type { z } from 'zod'
import type { posCategorieSchema } from './app/composables/usePosCategories'

export interface PosCategorie {
  id: string
  teamId: string
  owner: string
  eventId: string
  title: string
  displayOrder?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosCategorieFormData = z.infer<typeof posCategorieSchema>
export type NewPosCategorie = Omit<PosCategorie, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosCategorieFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosCategorie | Record<string, never> // PosCategorie for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}