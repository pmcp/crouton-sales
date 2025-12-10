<template>
  <div class="h-full flex flex-col">
    <ClientOfflineBanner />

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <UIcon name="i-lucide-alert-circle" class="text-4xl text-red-500 mb-2" />
        <p class="text-gray-700 dark:text-gray-300">{{ error }}</p>
        <UButton class="mt-4" @click="loadData">
          Retry
        </UButton>
      </div>
    </div>

    <template v-else>
      <div class="p-4 border-b">
        <ClientCategoryTabs
          v-model="selectedCategory"
          :categories="categories"
          :product-counts="productCounts"
        />
      </div>

      <div class="flex-1 flex overflow-hidden">
        <div class="flex-1 overflow-y-auto p-4">
          <ClientProductList
            :products="filteredProducts"
            @select="addToCart"
          />
        </div>

        <div class="w-80 border-l overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <ClientCart
            :items="cartItems"
            :total="cartTotal"
            :disabled="!isOnline"
            @update-quantity="updateQuantity"
            @remove="removeFromCart"
            @checkout="handleCheckout"
            @clear="clearCart"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { PosProduct } from '~~/layers/pos/collections/products/types'
import type { PosCategory } from '~~/layers/pos/collections/categories/types'

const props = defineProps<{
  eventId: string
}>()

const isOnline = useOnline()
const toast = useToast()
const { token } = useHelperAuth()

// Local state
const loading = ref(true)
const error = ref<string | null>(null)
const products = ref<PosProduct[]>([])
const categories = ref<PosCategory[]>([])
const selectedCategory = ref<string | null>(null)

// Cart state
interface CartItem {
  product: PosProduct
  quantity: number
}
const cartItems = ref<CartItem[]>([])

const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.product.price || 0) * item.quantity
  }, 0)
})

// Product counts per category
const productCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const product of products.value) {
    if (product.categoryId) {
      counts[product.categoryId] = (counts[product.categoryId] || 0) + 1
    }
  }
  return counts
})

// Filtered products based on selected category
const filteredProducts = computed(() => {
  if (selectedCategory.value === null) {
    return products.value.filter(p => p.isActive !== false)
  }
  return products.value.filter(p => p.categoryId === selectedCategory.value && p.isActive !== false)
})

// Cart functions
function addToCart(product: PosProduct) {
  const existingItem = cartItems.value.find(item => item.product.id === product.id)
  if (existingItem) {
    existingItem.quantity++
  }
  else {
    cartItems.value.push({ product, quantity: 1 })
  }
}

function removeFromCart(productId: string) {
  const index = cartItems.value.findIndex(item => item.product.id === productId)
  if (index !== -1) {
    cartItems.value.splice(index, 1)
  }
}

function updateQuantity(productId: string, quantity: number) {
  const item = cartItems.value.find(item => item.product.id === productId)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId)
    }
    else {
      item.quantity = quantity
    }
  }
}

function clearCart() {
  cartItems.value = []
}

// Load data from the helper-authenticated endpoint
async function loadData() {
  loading.value = true
  error.value = null

  try {
    const data = await $fetch(`/api/pos/events/${props.eventId}/order-data`, {
      headers: {
        'x-helper-token': token.value,
      },
    })

    products.value = data.products as PosProduct[]
    categories.value = data.categories as PosCategory[]
  }
  catch (err: any) {
    error.value = err.data?.message || err.statusMessage || 'Failed to load data'
  }
  finally {
    loading.value = false
  }
}

// Checkout function
async function handleCheckout() {
  if (cartItems.value.length === 0) {
    toast.add({
      title: 'Cart is empty',
      description: 'Add some items to your cart first.',
      color: 'warning',
    })
    return
  }

  try {
    // Create the order via helper-authenticated endpoint
    await $fetch(`/api/pos/events/${props.eventId}/orders`, {
      method: 'POST',
      headers: {
        'x-helper-token': token.value,
      },
      body: {
        items: cartItems.value.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          productName: item.product.title,
        })),
        total: cartTotal.value,
      },
    })

    clearCart()
    toast.add({
      title: 'Order created',
      description: 'The order has been submitted successfully.',
      color: 'success',
    })
  }
  catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.data?.message || err.statusMessage || 'Failed to create order',
      color: 'error',
    })
  }
}

// Load data on mount
onMounted(() => {
  loadData()
})
</script>
