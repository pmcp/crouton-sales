<template>
  <main class="h-screen flex">
    <!-- Loading state -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary" />
    </div>

    <!-- Not authenticated -->
    <div v-else-if="!isAuthenticated" class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4">
        <UIcon name="i-lucide-lock" class="text-4xl text-muted" />
        <p class="text-muted">Please login to access the order interface</p>
        <UButton
          :to="`/order/${teamSlug}/${eventSlug}/login`"
          icon="i-lucide-log-in"
        >
          Login
        </UButton>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4">
        <UIcon name="i-lucide-alert-circle" class="text-4xl text-error" />
        <p class="text-muted">{{ error }}</p>
        <UButton @click="loadData">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Order interface using DashboardPanel -->
    <template v-else>
      <!-- Products panel -->
      <UDashboardPanel id="pos-products" class="flex-1">
        <template #header>
          <UDashboardNavbar :title="orderData?.event.title">
            <template #leading>
              <UIcon name="i-lucide-store" class="text-primary" />
            </template>
            <template #right>
              <span class="text-sm text-muted mr-2">{{ orderData?.helper.name }}</span>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-log-out"
                size="sm"
                @click="handleLogout"
              />
            </template>
          </UDashboardNavbar>
        </template>

        <template #body>
          <!-- Category tabs -->
          <div class="mb-4">
            <ClientCategoryTabs
              v-model="selectedCategory"
              :categories="orderData?.categories || []"
              :product-counts="productCounts"
            />
          </div>

          <!-- Products grid -->
          <ClientProductList
            :products="filteredProducts"
            @select="addToCart"
          />
        </template>

        <!-- Mobile cart bar -->
        <template #footer>
          <div class="lg:hidden">
            <UDrawer direction="bottom">
              <div
                class="flex items-center justify-between px-4 py-3 bg-elevated/80 backdrop-blur-sm border border-default rounded-t-xl shadow-lg cursor-pointer hover:bg-elevated transition-colors"
              >
                <div class="flex items-center gap-2">
                  <span class="text-base font-medium">Total</span>
                  <span
                    v-if="cartItemCount > 0"
                    :key="cartItemCount"
                    class="bg-primary text-primary-foreground text-xs font-medium rounded px-1.5 py-0.5 animate-pop"
                  >
                    {{ cartItemCount }}
                  </span>
                </div>
                <span :key="cartTotal" class="text-base font-semibold animate-pop">${{ cartTotal.toFixed(2) }}</span>
              </div>

              <template #content>
                <div class="h-[70vh] flex flex-col">
                  <!-- Client selector -->
                  <div class="p-4 border-b shrink-0">
                    <ClientSelector
                      :clients="orderData?.clients || []"
                      :use-reusable-clients="orderData?.settings.useReusableClients || false"
                      :highlight="!hasClient && cartItems.length > 0"
                      :client-id="selectedClientId"
                      :client-name="selectedClientName"
                      @update:client-id="onClientIdChange"
                      @update:client-name="onClientNameChange"
                    />
                  </div>

                  <!-- Cart -->
                  <div class="flex-1 min-h-0">
                    <ClientCart
                      :items="cartItems"
                      :total="cartTotal"
                      :disabled="!isOnline"
                      :client-required="true"
                      :has-client="hasClient"
                      @update-quantity="updateQuantity"
                      @remove="removeFromCart"
                      @checkout="handleCheckout"
                      @clear="clearCart"
                    />
                  </div>
                </div>
              </template>
            </UDrawer>
          </div>
        </template>
      </UDashboardPanel>

      <!-- Cart panel (desktop only) -->
      <UDashboardPanel id="pos-cart" class="hidden lg:flex w-80">
        <template #header>
          <UDashboardNavbar title="Cart">
            <template #leading>
              <UIcon name="i-lucide-shopping-cart" />
            </template>
            <template #right>
              <UBadge v-if="cartItems.length > 0" :label="cartItems.length" size="sm" />
            </template>
          </UDashboardNavbar>
        </template>

        <div class="flex flex-col h-full">
          <!-- Client selector -->
          <div class="p-4 border-b">
            <ClientSelector
              :clients="orderData?.clients || []"
              :use-reusable-clients="orderData?.settings.useReusableClients || false"
              :highlight="!hasClient && cartItems.length > 0"
              :client-id="selectedClientId"
              :client-name="selectedClientName"
              @update:client-id="onClientIdChange"
              @update:client-name="onClientNameChange"
            />
          </div>

          <!-- Cart -->
          <div class="flex-1 min-h-0">
            <ClientCart
              :items="cartItems"
              :total="cartTotal"
              :disabled="!isOnline"
              :client-required="true"
              :has-client="hasClient"
              @update-quantity="updateQuantity"
              @remove="removeFromCart"
              @checkout="handleCheckout"
              @clear="clearCart"
            />
          </div>
        </div>
      </UDashboardPanel>
    </template>
  </main>
</template>

<script setup lang="ts">
import type { PosProduct } from '~~/layers/pos/collections/products/types'
import type { PosCategorie } from '~~/layers/pos/collections/categories/types'

definePageMeta({
  layout: false,
  middleware: ['order-auth'],
})

interface Client {
  id: string
  title: string
}

interface OrderData {
  event: { id: string; title: string; slug: string; teamId: string }
  products: PosProduct[]
  categories: PosCategorie[]
  clients: Client[]
  settings: { useReusableClients: boolean }
  helper: { id: string; name: string }
}

interface ProductOption {
  id: string
  label: string
  priceModifier: number
}

interface CartItem {
  product: PosProduct
  quantity: number
  selectedOptions?: string | string[]
}

const route = useRoute()
const toast = useToast()
const isOnline = useOnline()

const teamSlug = computed(() => route.params.team as string)
const eventSlug = computed(() => route.params.event as string)

const { isHelper, loadSession, logout, token, eventId: sessionEventId, teamId: sessionTeamId } = useHelperAuth()

const loading = ref(true)
const error = ref<string | null>(null)
const isAuthenticated = ref(false)
const orderData = ref<OrderData | null>(null)

// Cart state
const cartItems = ref<CartItem[]>([])
const selectedCategory = ref<string | null>(null)

// Client selection state
const selectedClientId = ref<string | null>(null)
const selectedClientName = ref('')

// Check if we have a valid client selected
const hasClient = computed(() => {
  if (orderData.value?.settings.useReusableClients) {
    // In reusable mode, need either a selected client ID or a name (for newly created)
    return !!selectedClientId.value || !!selectedClientName.value.trim()
  }
  // In free-text mode, need a name
  return !!selectedClientName.value.trim()
})

const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + calculateItemPrice(item) * item.quantity
  }, 0)
})

const cartItemCount = computed(() => {
  return cartItems.value.reduce((count, item) => count + item.quantity, 0)
})

function calculateItemPrice(item: CartItem): number {
  let price = Number(item.product.price) || 0
  if (item.selectedOptions && item.product.options) {
    const optionIds = Array.isArray(item.selectedOptions)
      ? item.selectedOptions
      : [item.selectedOptions]
    for (const id of optionIds) {
      const option = (item.product.options as ProductOption[]).find(o => o.id === id)
      if (option?.priceModifier) {
        price += option.priceModifier
      }
    }
  }
  return price
}

const productCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const product of orderData.value?.products || []) {
    if (product.categoryId) {
      counts[product.categoryId] = (counts[product.categoryId] || 0) + 1
    }
  }
  return counts
})

const filteredProducts = computed(() => {
  const allProducts = orderData.value?.products || []
  if (selectedCategory.value === null) {
    return allProducts.filter(p => p.isActive !== false)
  }
  return allProducts.filter(p => p.categoryId === selectedCategory.value && p.isActive !== false)
})

// Cart functions
function optionsEqual(a?: string | string[], b?: string | string[]): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  if (typeof a === 'string' && typeof b === 'string') return a === b
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((val, i) => val === sortedB[i])
  }
  return false
}

function addToCart(product: PosProduct, selectedOption?: string | string[]) {
  // Find existing item with same product and same options
  const existingItem = cartItems.value.find((item) => {
    if (item.product.id !== product.id) return false
    return optionsEqual(item.selectedOptions, selectedOption)
  })

  if (existingItem) {
    existingItem.quantity++
  }
  else {
    cartItems.value.push({
      product,
      quantity: 1,
      ...(selectedOption && { selectedOptions: selectedOption }),
    })
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
    }
    else {
      const item = cartItems.value[index]
      if (item) {
        item.quantity = quantity
      }
    }
  }
}

function clearCart() {
  cartItems.value = []
  selectedClientId.value = null
  selectedClientName.value = ''
}

// Client functions
function onClientIdChange(clientId: string | null) {
  selectedClientId.value = clientId
}

function onClientNameChange(name: string) {
  selectedClientName.value = name
}

async function onCreateClient(name: string) {
  // For now, just use the name as free-text
  // In the future, we could create a new client in the database
  selectedClientName.value = name
  selectedClientId.value = null
}

async function loadData() {
  loading.value = true
  error.value = null

  loadSession()

  if (!isHelper.value) {
    loading.value = false
    return
  }

  try {
    // Fetch the team ID from slug
    const teamResponse = await $fetch<{ id: string }>(`/api/teams/by-slug/${teamSlug.value}`)

    // Verify the session matches this team
    if (sessionTeamId.value !== teamResponse.id) {
      loading.value = false
      return
    }

    // Fetch the event by slug
    const eventResponse = await $fetch<{ id: string }>(`/api/pos/events/${teamResponse.id}/by-slug/${eventSlug.value}`)

    // Verify the session matches this event
    if (sessionEventId.value !== eventResponse.id) {
      loading.value = false
      return
    }

    // Fetch order data using helper token
    orderData.value = await $fetch<OrderData>(`/api/pos/events/${eventResponse.id}/order-data`, {
      headers: {
        'x-helper-token': token.value,
      },
    })

    isAuthenticated.value = true
  }
  catch (err: any) {
    error.value = err.data?.message || err.statusMessage || 'Failed to load data'
    console.error('Failed to load:', err)
  }
  finally {
    loading.value = false
  }
}

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
    await $fetch(`/api/pos/events/${orderData.value?.event.id}/orders`, {
      method: 'POST',
      headers: {
        'x-helper-token': token.value,
      },
      body: {
        items: cartItems.value.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: calculateItemPrice(item),
          productName: item.product.title,
          selectedOptions: item.selectedOptions,
        })),
        total: cartTotal.value,
        clientId: selectedClientId.value || undefined,
        clientName: selectedClientName.value || undefined,
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

async function handleLogout() {
  await logout()
  await navigateTo(`/order/${teamSlug.value}/${eventSlug.value}/login`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.animate-pop {
  animation: pop 0.15s ease-out;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
