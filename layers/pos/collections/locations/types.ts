import type { z } from 'zod'
import type { posLocationSchema } from './app/composables/usePosLocations'

export interface PosLocation {
  id: string
  teamId: string
  owner: string
  eventId: string
  name: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosLocationFormData = z.infer<typeof posLocationSchema>
export type NewPosLocation = Omit<PosLocation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosLocationFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosLocation | Record<string, never> // PosLocation for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}