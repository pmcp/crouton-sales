import { z } from 'zod'

export const posCategorieSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  name: z.string().min(1, 'name is required'),
  displayOrder: z.string().optional()
})

export const posCategoriesColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'displayOrder', header: 'DisplayOrder' }
]

export const posCategoriesConfig = {
  name: 'posCategories',
  layer: 'pos',
  apiPath: 'pos-categories',
  componentName: 'PosCategoriesForm',
  schema: posCategorieSchema,
  defaultValues: {
    eventId: '',
    name: '',
    displayOrder: ''
  },
  columns: posCategoriesColumns,
}

export const usePosCategories = () => posCategoriesConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posCategoriesConfig.defaultValues,
    schema: posCategoriesConfig.schema,
    columns: posCategoriesConfig.columns,
    collection: posCategoriesConfig.name
  }
}