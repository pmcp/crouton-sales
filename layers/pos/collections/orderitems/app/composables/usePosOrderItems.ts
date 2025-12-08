import { z } from 'zod'

export const posOrderItemSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
  productId: z.string().min(1, 'productId is required'),
  quantity: z.string().min(1, 'quantity is required'),
  unitPrice: z.number(),
  totalPrice: z.number(),
  remarks: z.string().optional(),
  selectedOptions: z.record(z.any()).optional()
})

export const posOrderItemsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'orderId', header: 'OrderId' },
  { accessorKey: 'productId', header: 'ProductId' },
  { accessorKey: 'quantity', header: 'Quantity' },
  { accessorKey: 'unitPrice', header: 'UnitPrice' },
  { accessorKey: 'totalPrice', header: 'TotalPrice' },
  { accessorKey: 'remarks', header: 'Remarks' },
  { accessorKey: 'selectedOptions', header: 'SelectedOptions' }
]

export const posOrderItemsConfig = {
  name: 'posOrderItems',
  layer: 'pos',
  apiPath: 'pos-orderitems',
  componentName: 'PosOrderItemsForm',
  schema: posOrderItemSchema,
  defaultValues: {
    orderId: '',
    productId: '',
    quantity: '',
    unitPrice: 0,
    totalPrice: 0,
    remarks: '',
    selectedOptions: {}
  },
  columns: posOrderItemsColumns,
}

export const usePosOrderItems = () => posOrderItemsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posOrderItemsConfig.defaultValues,
    schema: posOrderItemsConfig.schema,
    columns: posOrderItemsConfig.columns,
    collection: posOrderItemsConfig.name
  }
}