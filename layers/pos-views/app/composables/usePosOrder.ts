import type { PosProduct } from '~~/layers/pos/collections/products/types'

export interface CartItem {
  product: PosProduct
  quantity: number
}

export function usePosOrder() {
  const cartItems = ref<CartItem[]>([])
  const selectedEventId = ref<string | null>(null)
  const selectedClientId = ref<string | null>(null)

  const cartTotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0),
  )

  const cartItemCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  function addToCart(product: PosProduct) {
    const existing = cartItems.value.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity++
    }
    else {
      cartItems.value.push({ product, quantity: 1 })
    }
  }

  function removeFromCart(productId: string) {
    const index = cartItems.value.findIndex(i => i.product.id === productId)
    if (index > -1)
      cartItems.value.splice(index, 1)
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = cartItems.value.find(i => i.product.id === productId)
    if (item) {
      if (quantity <= 0)
        removeFromCart(productId)
      else item.quantity = quantity
    }
  }

  function clearCart() {
    cartItems.value = []
  }

  async function checkout() {
    if (!selectedEventId.value) {
      throw new Error('No event selected')
    }

    if (cartItems.value.length === 0) {
      throw new Error('Cart is empty')
    }

    const { create: createOrder } = useCollectionMutation('posOrders')
    const { create: createOrderItem } = useCollectionMutation('posOrderItems')

    // Create the order
    const order = await createOrder({
      eventId: selectedEventId.value,
      clientId: selectedClientId.value || undefined,
      status: 'pending',
    })

    // Create order items
    for (const item of cartItems.value) {
      const unitPrice = Number(item.product.price)
      const totalPrice = unitPrice * item.quantity
      await createOrderItem({
        orderId: order.id,
        productId: item.product.id,
        quantity: String(item.quantity), // Schema expects text
        unitPrice,
        totalPrice,
      })
    }

    // Clear cart after successful checkout
    clearCart()
    selectedClientId.value = null

    return order
  }

  return {
    cartItems,
    selectedEventId,
    selectedClientId,
    cartTotal,
    cartItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
  }
}
