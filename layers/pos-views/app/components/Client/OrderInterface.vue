<template>
  <div class="h-full flex flex-col">
    <ClientOfflineBanner />

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" />
    </div>

    <template v-else>
      <!-- Category tabs -->
      <div class="p-2 border-b shrink-0">
        <ClientCategoryTabs
          v-model="selectedCategory"
          :categories="categories || []"
          :product-counts="productCounts"
        />
      </div>

      <!-- Main content area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Products grid -->
        <div class="flex-1 overflow-y-auto p-2">
          <ClientProductList
            :products="filteredProducts"
            @select="addToCart"
          />
        </div>

        <!-- Cart sidebar (desktop only) -->
        <div class="hidden md:flex w-80 border-l flex-col">
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

      <!-- Mobile cart button -->
      <div class="md:hidden border-t p-2">
        <UDrawer direction="bottom">
          <UButton
            block
            size="lg"
            :label="cartItems.length > 0 ? `Cart (${cartItems.length}) - $${cartTotal.toFixed(2)}` : 'Cart is empty'"
            :icon="cartItems.length > 0 ? 'i-lucide-shopping-cart' : 'i-lucide-shopping-cart'"
            :color="cartItems.length > 0 ? 'primary' : 'neutral'"
            :variant="cartItems.length > 0 ? 'solid' : 'soft'"
          />

          <template #content>
            <div class="h-[70vh]">
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
          </template>
        </UDrawer>
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
