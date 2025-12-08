import type { z } from 'zod'
import type { posClientSchema } from './app/composables/usePosClients'

export interface PosClient {
  id: string
  teamId: string
  owner: string
  name: string
  isReusable?: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosClientFormData = z.infer<typeof posClientSchema>
export type NewPosClient = Omit<PosClient, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosClientFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosClient | Record<string, never> // PosClient for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}