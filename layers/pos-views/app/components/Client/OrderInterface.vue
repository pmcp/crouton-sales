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
            @select="handleProductSelect"
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

      <!-- Product Options Modal -->
      <UModal v-model:open="showOptionsModal" :title="pendingProduct?.title" :ui="{ footer: 'justify-end' }">
        <template #body>
          <ClientProductOptionsSelect
            v-model="selectedOptions"
            :options="productOptionsForPending"
            :multiple-allowed="pendingProduct?.multipleOptionsAllowed"
          />
        </template>

        <template #footer>
          <UButton label="Cancel" color="neutral" variant="ghost" @click="showOptionsModal = false" />
          <UButton
            label="Add to Cart"
            :disabled="!selectedOptions || (Array.isArray(selectedOptions) && selectedOptions.length === 0)"
            @click="confirmProductWithOptions"
          />
        </template>
      </UModal>

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
import type { ProductOption } from './ProductOptionsSelect.vue'

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

// Product options modal state
const showOptionsModal = ref(false)
const pendingProduct = ref<PosProduct | null>(null)
const selectedOptions = ref<string | string[] | null>(null)

// Get inline options from the pending product
const productOptionsForPending = computed<ProductOption[]>(() => {
  if (!pendingProduct.value?.options) return []
  const options = pendingProduct.value.options as ProductOption[]
  return Array.isArray(options) ? options : []
})

// Handle product selection - show modal if product has options
function handleProductSelect(product: PosProduct) {
  const options = (product.options as ProductOption[]) || []

  if (product.hasOptions && Array.isArray(options) && options.length > 0) {
    pendingProduct.value = product
    selectedOptions.value = product.multipleOptionsAllowed ? [] : null
    showOptionsModal.value = true
  } else {
    addToCart(product)
  }
}

// Confirm product with selected options
function confirmProductWithOptions() {
  if (!pendingProduct.value || !selectedOptions.value) return

  addToCart(pendingProduct.value, undefined, selectedOptions.value)

  // Reset modal state
  showOptionsModal.value = false
  pendingProduct.value = null
  selectedOptions.value = null
}

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
