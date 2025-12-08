import { z } from 'zod'

export const posProductSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  price: z.number(),
  isActive: z.boolean().optional(),
  requiresRemark: z.boolean().optional(),
  remarkPrompt: z.string().optional(),
  hasOptions: z.boolean().optional(),
  multipleOptionsAllowed: z.boolean().optional(),
  sortOrder: z.string().optional()
})

export const posProductsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'categoryId', header: 'CategoryId' },
  { accessorKey: 'locationId', header: 'LocationId' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'isActive', header: 'IsActive' },
  { accessorKey: 'requiresRemark', header: 'RequiresRemark' },
  { accessorKey: 'remarkPrompt', header: 'RemarkPrompt' },
  { accessorKey: 'hasOptions', header: 'HasOptions' },
  { accessorKey: 'multipleOptionsAllowed', header: 'MultipleOptionsAllowed' },
  { accessorKey: 'sortOrder', header: 'SortOrder' }
]

export const posProductsConfig = {
  name: 'posProducts',
  layer: 'pos',
  apiPath: 'pos-products',
  componentName: 'PosProductsForm',
  schema: posProductSchema,
  defaultValues: {
    eventId: '',
    categoryId: '',
    locationId: '',
    title: '',
    description: '',
    price: 0,
    isActive: false,
    requiresRemark: false,
    remarkPrompt: '',
    hasOptions: false,
    multipleOptionsAllowed: false,
    sortOrder: ''
  },
  columns: posProductsColumns,
}

export const usePosProducts = () => posProductsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posProductsConfig.defaultValues,
    schema: posProductsConfig.schema,
    columns: posProductsConfig.columns,
    collection: posProductsConfig.name
  }
}