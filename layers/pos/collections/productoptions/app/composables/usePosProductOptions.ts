import { z } from 'zod'

export const posProductOptionSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  optionName: z.string().min(1, 'optionName is required'),
  additionalPrice: z.number().optional(),
  displayOrder: z.string().optional()
})

export const posProductOptionsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'productId', header: 'ProductId' },
  { accessorKey: 'optionName', header: 'OptionName' },
  { accessorKey: 'additionalPrice', header: 'AdditionalPrice' },
  { accessorKey: 'displayOrder', header: 'DisplayOrder' }
]

export const posProductOptionsConfig = {
  name: 'posProductOptions',
  layer: 'pos',
  apiPath: 'pos-productoptions',
  componentName: 'PosProductOptionsForm',
  schema: posProductOptionSchema,
  defaultValues: {
    productId: '',
    optionName: '',
    additionalPrice: 0,
    displayOrder: ''
  },
  columns: posProductOptionsColumns,
}

export const usePosProductOptions = () => posProductOptionsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posProductOptionsConfig.defaultValues,
    schema: posProductOptionsConfig.schema,
    columns: posProductOptionsConfig.columns,
    collection: posProductOptionsConfig.name
  }
}