export interface CroutonCollectionEvent {
  id: string
  teamId: string
  owner: string
  timestamp: Date
  operation: 'create' | 'update' | 'delete'
  collectionName: string
  itemId: string
  userId: string
  userName: string
  changes: Array<{ fieldName: string; oldValue: unknown; newValue: unknown }>
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
  optimisticId?: string
  optimisticAction?: 'create' | 'update' | 'delete'
}

export type NewCroutonCollectionEvent = Omit<CroutonCollectionEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
