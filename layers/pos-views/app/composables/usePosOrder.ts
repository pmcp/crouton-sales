import type { PosProduct } from '~~/layers/pos/collections/products/types'

export interface CartItem {
  product: PosProduct
  quantity: number
  remarks?: string
  selectedOptions?: Record<string, any>
}

interface OrderItem {
  productId: string
  quantity: number
  price: number
  productName?: string
  remarks?: string
  selectedOptions?: Record<string, any>
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

export function usePosOrder() {
  const cartItems = ref<CartItem[]>([])
  const selectedEventId = ref<string | null>(null)
  const selectedClientId = ref<string | null>(null)
  const selectedClientName = ref<string | null>(null)
  const overallRemarks = ref<string | null>(null)
  const isPersonnel = ref(false)

  const cartTotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0),
  )

  const cartItemCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  function addToCart(product: PosProduct, remarks?: string, selectedOptions?: Record<string, any>) {
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
        cartItems.value[index].quantity = quantity
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

    // Build order items
    const items: OrderItem[] = cartItems.value.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: Number(item.product.price),
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
