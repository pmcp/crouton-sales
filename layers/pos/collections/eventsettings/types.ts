import type { z } from 'zod'
import type { posEventSettingSchema } from './app/composables/usePosEventSettings'

export interface PosEventSetting {
  id: string
  teamId: string
  owner: string
  eventId: string
  settingKey: string
  settingValue?: string
  description?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type PosEventSettingFormData = z.infer<typeof posEventSettingSchema>
export type NewPosEventSetting = Omit<PosEventSetting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

// Props type for the Form component
export interface PosEventSettingFormProps {
  items: string[] // Array of IDs for delete action
  activeItem: PosEventSetting | Record<string, never> // PosEventSetting for update, empty object for create
  collection: string
  loading: string
  action: 'create' | 'update' | 'delete'
}