import type { z } from 'zod'
import type { posHelperSchema } from './app/composables/usePosHelpers'

export interface PosHelper {
  id: string
  teamId: string
  owner: string
  eventId: string
  name: string
  token: string
  isActive?: boolean
  expiresAt?: Date | null
  lastActiveAt?: Date | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosHelperFormData = z.infer<typeof posHelperSchema>
export type NewPosHelper = Omit<PosHelper, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosHelperFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosHelper | Record<string, never> // PosHelper for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}