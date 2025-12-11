import type { PosProduct } from '~~/layers/pos/collections/products/types'

// Inline product option structure (stored in product.options JSON field)
interface ProductOption {
  id: string
  label: string
  priceModifier: number
}

// PosProduct with typed options array
interface ProductWithOptions extends PosProduct {
  options?: ProductOption[]
}

export interface CartItem {
  product: ProductWithOptions
  quantity: number
  remarks?: string
  selectedOptions?: string | string[]
}

interface OrderItem {
  productId: string
  quantity: number
  price: number
  productName?: string
  remarks?: string
  selectedOptions?: string | string[]
}

interface CreateOrderResponse {
  order: {
    id: string
    eventOrderNumber: string
    status: string
  }
  items: any[]
  eventOrderNumber: string
}

// Calculate item price including option modifiers
function calculateItemPrice(item: CartItem): number {
  let price = Number(item.product.price)
  if (item.selectedOptions && item.product.options) {
    const optionIds = Array.isArray(item.selectedOptions)
      ? item.selectedOptions
      : [item.selectedOptions]
    for (const id of optionIds) {
      const option = item.product.options.find(o => o.id === id)
      if (option?.priceModifier) {
        price += option.priceModifier
      }
    }
  }
  return price
}

export function usePosOrder() {
  const cartItems = ref<CartItem[]>([])
  const selectedEventId = ref<string | null>(null)
  const selectedClientId = ref<string | null>(null)
  const selectedClientName = ref<string | null>(null)
  const overallRemarks = ref<string | null>(null)
  const isPersonnel = ref(false)

  const cartTotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (calculateItemPrice(item) * item.quantity), 0),
  )

  const cartItemCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  function addToCart(product: ProductWithOptions, remarks?: string, selectedOptions?: string | string[]) {
    // If product has remarks or options, always add as new item
    if (remarks || selectedOptions) {
      cartItems.value.push({ product, quantity: 1, remarks, selectedOptions })
      return
    }

    const existing = cartItems.value.find(i =>
      i.product.id === product.id && !i.remarks && !i.selectedOptions
    )
    if (existing) {
      existing.quantity++
    }
    else {
      cartItems.value.push({ product, quantity: 1 })
    }
  }

  function removeFromCart(index: number) {
    if (index >= 0 && index < cartItems.value.length) {
      cartItems.value.splice(index, 1)
    }
  }

  function updateQuantity(index: number, quantity: number) {
    if (index >= 0 && index < cartItems.value.length) {
      if (quantity <= 0) {
        removeFromCart(index)
      } else {
        const item = cartItems.value[index]
        if (item) {
          item.quantity = quantity
        }
      }
    }
  }

  function clearCart() {
    cartItems.value = []
    overallRemarks.value = null
    isPersonnel.value = false
  }

  async function checkout(): Promise<CreateOrderResponse> {
    if (!selectedEventId.value) {
      throw new Error('No event selected')
    }

    if (cartItems.value.length === 0) {
      throw new Error('Cart is empty')
    }

    // Build order items with adjusted prices for options
    const items: OrderItem[] = cartItems.value.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: calculateItemPrice(item),
      productName: item.product.title,
      remarks: item.remarks,
      selectedOptions: item.selectedOptions,
    }))

    // Create order via helper-authenticated endpoint
    const response = await $fetch<CreateOrderResponse>(
      `/api/pos/events/${selectedEventId.value}/orders`,
      {
        method: 'POST',
        body: {
          items,
          total: cartTotal.value,
          clientId: selectedClientId.value,
          clientName: selectedClientName.value,
          overallRemarks: overallRemarks.value,
          isPersonnel: isPersonnel.value,
        },
      }
    )

    // Trigger print queue generation
    try {
      await $fetch(
        `/api/pos/events/${selectedEventId.value}/orders/${response.order.id}/print`,
        { method: 'POST' }
      )
    } catch (printError) {
      // Log but don't fail checkout if printing fails
      console.error('Failed to trigger print queue:', printError)
    }

    // Clear cart after successful checkout
    clearCart()
    selectedClientId.value = null
    selectedClientName.value = null

    return response
  }

  return {
    cartItems,
    selectedEventId,
    selectedClientId,
    selectedClientName,
    overallRemarks,
    isPersonnel,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
  }
}
