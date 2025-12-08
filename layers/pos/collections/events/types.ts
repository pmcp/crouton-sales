import type { z } from 'zod'
import type { posEventSchema } from './app/composables/usePosEvents'

export interface PosEvent {
  id: string
  teamId: string
  owner: string
  title: string
  slug: string
  description?: string
  eventType?: string
  startDate?: Date | null
  endDate?: Date | null
  status: string
  isCurrent?: boolean
  helperPin?: string
  metadata?: Record<string, any>
  archivedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosEventFormData = z.infer<typeof posEventSchema>
export type NewPosEvent = Omit<PosEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosEventFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosEvent | Record<string, never> // PosEvent for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}