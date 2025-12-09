<template>
  <div class="h-full flex flex-col">
    <ClientOfflineBanner />

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
    </div>

    <template v-else>
      <div class="p-4 border-b">
        <ClientCategoryTabs
          v-model="selectedCategory"
          :categories="categories || []"
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

const {
  cartItems,
  cartTotal,
  selectedEventId,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  checkout,
} = usePosOrder()

// Set the event ID
selectedEventId.value = props.eventId

// Fetch categories and products for this event
const { items: categories, pending: categoriesLoading } = await useCollectionQuery('posCategories', {
  query: computed(() => ({ eventId: props.eventId })),
})

const { items: products, pending: productsLoading } = await useCollectionQuery('posProducts', {
  query: computed(() => ({ eventId: props.eventId })),
})

const loading = computed(() => categoriesLoading.value || productsLoading.value)

// Category selection
const selectedCategory = ref<string | null>(null)

// Product counts per category
const productCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const product of (products.value || []) as PosProduct[]) {
    if (product.categoryId) {
      counts[product.categoryId] = (counts[product.categoryId] || 0) + 1
    }
  }
  return counts
})

// Filtered products based on selected category
const filteredProducts = computed(() => {
  const allProducts = (products.value || []) as PosProduct[]
  if (selectedCategory.value === null) {
    return allProducts.filter(p => p.isActive !== false)
  }
  return allProducts.filter(p => p.categoryId === selectedCategory.value && p.isActive !== false)
})

async function handleCheckout() {
  try {
    await checkout()
    toast.add({
      title: 'Order created',
      description: 'The order has been submitted successfully.',
      color: 'green',
    })
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to create order',
      color: 'red',
    })
  }
}
</script>
