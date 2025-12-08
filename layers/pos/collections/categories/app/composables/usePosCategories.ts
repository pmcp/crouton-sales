import { z } from 'zod'

export const posCategorieSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  title: z.string().min(1, 'title is required'),
  displayOrder: z.string().optional()
})

export const posCategoriesColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'title', header: 'Title' },
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
    title: '',
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