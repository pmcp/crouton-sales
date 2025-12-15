<template>
  <div v-if="!event" class="flex items-center justify-center h-full">
    <div class="text-center">
      <UIcon name="i-lucide-alert-circle" class="text-4xl text-gray-400 mb-2" />
      <p class="text-gray-500">Event not found</p>
    </div>
  </div>

  <div v-else class="p-6 space-y-6">
    <!-- Header with Event Switcher -->
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <USelectMenu
          :model-value="event.id"
          :items="eventOptions"
          value-key="id"
          placeholder="Select event..."
          icon="i-lucide-calendar"
          size="lg"
          class="w-72"
          :ui="{ base: 'font-semibold text-lg' }"
          @update:model-value="switchEvent"
        />
        <p class="text-muted text-sm">
          {{ event.eventType }}
          <span v-if="event.startDate"> &middot; {{ formatDate(event.startDate) }}</span>
          <span v-if="event.endDate"> - {{ formatDate(event.endDate) }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <UButton variant="outline" icon="i-lucide-pencil" size="sm" @click="openEditEvent">
          Edit
        </UButton>
        <UButton
          variant="outline"
          icon="i-lucide-copy"
          size="sm"
          :loading="duplicating"
          @click="duplicateEvent"
        >
          Duplicate
        </UButton>
        <UButton
          icon="i-lucide-shopping-cart"
          size="sm"
          :to="`/order/${route.params.team}/${event.slug}`"
        >
          Open POS
        </UButton>
      </div>
    </div>

    <!-- Tabs -->
    <UTabs v-model="activeTab" :items="tabItems" :content="false" />

    <!-- Tab Content -->
    <div class="min-h-[400px]">
      <!-- Products Tab -->
      <div v-if="activeTab === 'products'" class="space-y-4">
        <div class="flex items-center justify-between">
          <ClientCategoryTabs
            v-model="selectedCategoryId"
            :categories="(categories as any[]) || []"
            :product-counts="productCountsByCategory"
          />
          <UButton color="primary" size="sm" icon="i-lucide-plus" @click="openCreateProduct">
            Add Product
          </UButton>
        </div>
        <div v-if="productsPending" class="p-6 text-center text-muted">
          Loading products...
        </div>
        <CroutonCollection
          v-else-if="filteredProducts && filteredProducts.length > 0"
          layout="table"
          collection="posProducts"
          :rows="filteredProducts"
          :columns="productsColumns"
          sortable
          :hide-default-columns="{ createdAt: true, updatedAt: true, createdBy: true, updatedBy: true }"
        />
        <div v-else class="p-12 text-center text-muted">
          <UIcon name="i-lucide-package" class="text-4xl mb-2" />
          <p>No products{{ selectedCategoryId ? ' in this category' : '' }}</p>
          <UButton size="sm" variant="outline" class="mt-3" @click="openCreateProduct">
            Add Product
          </UButton>
        </div>
      </div>

      <!-- Orders Tab -->
      <div v-if="activeTab === 'orders'" class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <USelectMenu
              v-model="selectedHelperId"
              :items="helperOptions"
              value-key="id"
              placeholder="All Helpers"
              icon="i-lucide-user"
              size="sm"
              class="w-48"
              :searchable="true"
            />
            <USwitch
              v-model="autoRefreshOrders"
              label="Auto-refresh"
              size="sm"
            />
          </div>
          <div class="flex items-center gap-2 text-sm text-muted">
            <span>{{ (orders as any[])?.length || 0 }} orders</span>
            <UButton
              variant="ghost"
              size="xs"
              icon="i-lucide-refresh-cw"
              :loading="ordersRefreshing"
              @click="refreshOrders"
            />
          </div>
        </div>
        <div v-if="ordersPending" class="p-6 text-center text-muted">
          Loading orders...
        </div>
        <CroutonCollection
          v-else-if="filteredOrders && filteredOrders.length > 0"
          layout="table"
          collection="posOrders"
          :rows="filteredOrders"
          :columns="ordersColumns"
          sortable
          :hide-default-columns="{ createdAt: true, updatedAt: true, createdBy: true, updatedBy: true }"
        />
        <div v-else class="p-12 text-center text-muted">
          <UIcon name="i-lucide-receipt" class="text-4xl mb-2" />
          <p>No orders yet{{ selectedHelperId ? ' for this helper' : '' }}</p>
        </div>
      </div>

      <!-- Printers Tab -->
      <div v-if="activeTab === 'printers'" class="space-y-4">
        <div class="flex justify-end">
          <UButton color="primary" size="sm" icon="i-lucide-plus" @click="openCreatePrinter">
            Add Printer
          </UButton>
        </div>
        <div v-if="printersPending" class="p-6 text-center text-muted">
          Loading printers...
        </div>
        <CroutonCollection
          v-else-if="printers && (printers as any[]).length > 0"
          layout="grid"
          collection="posPrinters"
          :rows="printers"
        >
          <template #card-actions="{ row }">
            <UButton
              variant="ghost"
              size="xs"
              icon="i-lucide-eye"
              @click.stop="openPrinterPreview(row)"
            >
              Preview
            </UButton>
          </template>
        </CroutonCollection>
        <div v-else class="p-12 text-center text-muted">
          <UIcon name="i-lucide-printer" class="text-4xl mb-2" />
          <p>No printers configured</p>
          <UButton size="sm" variant="outline" class="mt-3" @click="openCreatePrinter">
            Add Printer
          </UButton>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <!-- Settings Cards Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Client Mode Setting -->
          <UCard variant="soft">
            <div class="space-y-3">
              <h3 class="font-semibold">Client Selection</h3>
              <USwitch
                v-model="useReusableClients"
                label="Use Reusable Clients"
                description="Select from existing clients or use free-text names"
                :loading="savingClientMode"
                @update:model-value="saveClientModeSetting"
              />
            </div>
          </UCard>

          <!-- Helper PIN Setting -->
          <UCard variant="soft">
            <div class="space-y-3">
              <h3 class="font-semibold">Helper PIN</h3>
              <div class="flex gap-2">
                <UInput
                  v-model="helperPin"
                  type="text"
                  placeholder="Enter PIN"
                  size="sm"
                  :ui="{ base: 'font-mono' }"
                  class="flex-1"
                />
                <UButton
                  size="sm"
                  :loading="savingHelperPin"
                  :disabled="helperPin === originalHelperPin"
                  @click="saveHelperPin"
                >
                  Save
                </UButton>
              </div>
            </div>
          </UCard>

          <!-- Receipt Settings -->
          <UCard variant="soft">
            <div class="space-y-3">
              <h3 class="font-semibold">Receipt Settings</h3>
              <UButton
                variant="outline"
                icon="i-lucide-receipt"
                size="sm"
                block
                @click="showReceiptSettings = true"
              >
                Edit Receipt Text
              </UButton>
            </div>
          </UCard>
        </div>

        <!-- Categories Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Categories</h3>
              <UButton size="xs" variant="outline" icon="i-lucide-plus" @click="openCreateCategory">
                Add
              </UButton>
            </div>
          </template>
          <div v-if="categoriesPending" class="p-4 text-center text-muted text-sm">
            Loading...
          </div>
          <CroutonCollection
            v-else-if="categories && (categories as any[]).length > 0"
            layout="grid"
            collection="posCategories"
            :rows="categories"
          />
          <div v-else class="p-4 text-center text-muted text-sm">
            No categories
          </div>
        </UCard>

        <!-- Locations Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Locations</h3>
              <UButton size="xs" variant="outline" icon="i-lucide-plus" @click="openCreateLocation">
                Add
              </UButton>
            </div>
          </template>
          <div v-if="locationsPending" class="p-4 text-center text-muted text-sm">
            Loading...
          </div>
          <CroutonCollection
            v-else-if="locations && (locations as any[]).length > 0"
            layout="grid"
            collection="posLocations"
            :rows="locations"
          />
          <div v-else class="p-4 text-center text-muted text-sm">
            No locations
          </div>
        </UCard>

        <!-- Helpers Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Helpers</h3>
              <UButton size="xs" variant="outline" icon="i-lucide-plus" @click="openCreateHelper">
                Add
              </UButton>
            </div>
          </template>
          <div v-if="helpersPending" class="p-4 text-center text-muted text-sm">
            Loading...
          </div>
          <CroutonCollection
            v-else-if="helpers && (helpers as any[]).length > 0"
            layout="grid"
            collection="posHelpers"
            :rows="helpers"
          />
          <div v-else class="p-4 text-center text-muted text-sm">
            No helpers
          </div>
        </UCard>
      </div>
    </div>

    <!-- Receipt Settings Modal -->
    <SettingsReceiptSettingsModal
      v-if="event"
      v-model="showReceiptSettings"
      :team-id="route.params.team as string"
      :event-id="event.id"
      @saved="loadReceiptSettings"
    />

    <!-- Print Preview Modal -->
    <SettingsPrintPreviewModal
      v-model="showPrinterPreview"
      :printer="selectedPrinter"
      :team-id="route.params.team as string"
      :receipt-settings="receiptSettings"
    />
  </div>
</template>

<script setup lang="ts">
import type { PosEvent } from '~~/layers/pos/collections/events/types'
import type { PosEventSetting } from '~~/layers/pos/collections/eventsettings/types'
import type { PosProduct } from '~~/layers/pos/collections/products/types'
import type { PosHelper } from '~~/layers/pos/collections/helpers/types'

definePageMeta({ middleware: ['auth'] })

const { open } = useCrouton()
const route = useRoute()

// Table columns
const { columns: ordersColumns } = usePosOrders()
const { columns: productsColumns } = usePosProducts()
const router = useRouter()
const eventSlug = computed(() => route.params.slug as string)

// Tab state
const activeTab = ref('products')
const tabItems = [
  { label: 'Products', value: 'products', icon: 'i-lucide-package' },
  { label: 'Orders', value: 'orders', icon: 'i-lucide-receipt' },
  { label: 'Printers', value: 'printers', icon: 'i-lucide-printer' },
  { label: 'Settings', value: 'settings', icon: 'i-lucide-settings' },
]

// Fetch all events for switcher
const { items: events } = await useCollectionQuery('posEvents')

const event = computed(() =>
  (events.value as PosEvent[] | null)?.find(e => e.slug === eventSlug.value),
)

const eventOptions = computed(() =>
  (events.value as PosEvent[] | null)?.map(e => ({
    id: e.id,
    label: e.title,
    slug: e.slug,
  })) || [],
)

function switchEvent(eventId: string) {
  const selectedEvent = eventOptions.value.find(e => e.id === eventId)
  if (selectedEvent && selectedEvent.slug !== eventSlug.value) {
    router.push(`/dashboard/${route.params.team}/events/${selectedEvent.slug}`)
  }
}

// Query for event-scoped data
const eventQuery = computed(() => event.value ? { eventId: event.value.id } : {})

// Filter state (declare before queries that use them)
const selectedCategoryId = ref<string | null>(null)
const selectedHelperId = ref<string | null>(null)
const autoRefreshOrders = ref(false)

// Fetch entity data
const { items: locations, pending: locationsPending } = await useCollectionQuery('posLocations', { query: eventQuery })
const { items: categories, pending: categoriesPending } = await useCollectionQuery('posCategories', { query: eventQuery })
const { items: products, pending: productsPending } = await useCollectionQuery('posProducts', { query: eventQuery })
const { items: printers, pending: printersPending } = await useCollectionQuery('posPrinters', { query: eventQuery })
const { items: helpers, pending: helpersPending } = await useCollectionQuery('posHelpers', { query: eventQuery })

// Orders query with refresh capability
const ordersQuery = computed(() => {
  const q: Record<string, string> = {}
  if (event.value) q.eventId = event.value.id
  if (selectedHelperId.value) q.owner = selectedHelperId.value
  return q
})
const { items: orders, pending: ordersPending, refresh: refreshOrders } = await useCollectionQuery('posOrders', { query: ordersQuery, watch: true })
const ordersRefreshing = ref(false)

// Products filtering
const productCountsByCategory = computed(() => {
  const counts: Record<string, number> = {}
  const productList = (products.value as PosProduct[] | null) || []
  for (const product of productList) {
    if (product.categoryId) {
      counts[product.categoryId] = (counts[product.categoryId] || 0) + 1
    }
  }
  return counts
})

const filteredProducts = computed(() => {
  const productList = (products.value as PosProduct[] | null) || []
  if (!selectedCategoryId.value) return productList
  return productList.filter(p => p.categoryId === selectedCategoryId.value)
})

const helperOptions = computed(() => {
  const helperList = (helpers.value as PosHelper[] | null) || []
  return [
    { id: null, label: 'All Helpers' },
    ...helperList.map(h => ({ id: h.id, label: h.title })),
  ]
})

const filteredOrders = computed(() => {
  // Orders are already filtered by the query, just return them
  return orders.value || []
})

// Auto-refresh orders
let refreshInterval: ReturnType<typeof setInterval> | null = null

watch(autoRefreshOrders, (enabled) => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
  if (enabled) {
    refreshInterval = setInterval(async () => {
      ordersRefreshing.value = true
      await refreshOrders()
      ordersRefreshing.value = false
    }, 10000)
  }
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

// Event settings
const { items: allSettings, refresh: refreshSettings } = await useCollectionQuery('posEventSettings')

const eventSettings = computed(() =>
  (allSettings.value as PosEventSetting[] | null)?.filter(s => s.eventId === event.value?.id) || [],
)

const clientModeSetting = computed(() =>
  eventSettings.value.find(s => s.settingKey === 'use_reusable_clients'),
)

// Settings state
const useReusableClients = ref(false)
const savingClientMode = ref(false)
const helperPin = ref('')
const originalHelperPin = ref('')
const savingHelperPin = ref(false)
const duplicating = ref(false)
const showReceiptSettings = ref(false)
const showPrinterPreview = ref(false)
const selectedPrinter = ref<any>(null)

interface ReceiptSettings {
  items_section_title: string
  special_instructions_title: string
  complete_order_header: string
  staff_order_header: string
  footer_text: string
  test_title: string
  test_success_message: string
}

const receiptSettings = ref<ReceiptSettings>({
  items_section_title: 'ITEMS:',
  special_instructions_title: 'SPECIAL INSTRUCTIONS:',
  complete_order_header: '*** COMPLETE ORDER ***',
  staff_order_header: '*** STAFF ORDER ***',
  footer_text: 'Thank you for your order!',
  test_title: 'PRINTER TEST',
  test_success_message: 'Test completed successfully!',
})

// Initialize values
watch([event, eventSettings], () => {
  if (event.value) {
    helperPin.value = event.value.helperPin || ''
    originalHelperPin.value = event.value.helperPin || ''
    loadReceiptSettings()
  }
  if (clientModeSetting.value) {
    useReusableClients.value = clientModeSetting.value.settingValue === 'true'
  }
}, { immediate: true })

// Helpers
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

async function saveClientModeSetting(value: boolean) {
  if (!event.value) return
  savingClientMode.value = true
  try {
    const { create, update } = useCollectionMutation('posEventSettings')
    if (clientModeSetting.value) {
      await update(clientModeSetting.value.id, { settingValue: String(value) })
    } else {
      await create({
        eventId: event.value.id,
        settingKey: 'use_reusable_clients',
        settingValue: String(value),
        description: 'Whether to use reusable clients or free-text names',
      })
    }
    await refreshSettings()
  } catch {
    useReusableClients.value = !value
  } finally {
    savingClientMode.value = false
  }
}

async function saveHelperPin() {
  if (!event.value) return
  savingHelperPin.value = true
  try {
    const { update } = useCollectionMutation('posEvents')
    await update(event.value.id, { helperPin: helperPin.value || undefined })
    originalHelperPin.value = helperPin.value
  } finally {
    savingHelperPin.value = false
  }
}

function openEditEvent() {
  if (!event.value) return
  open('update', 'posEvents', [event.value.id])
}

function openCreateLocation() {
  if (!event.value) return
  open('create', 'posLocations', [], 'slideover', { eventId: event.value.id })
}

function openCreateCategory() {
  if (!event.value) return
  open('create', 'posCategories', [], 'slideover', { eventId: event.value.id })
}

function openCreateProduct() {
  if (!event.value) return
  open('create', 'posProducts', [], 'slideover', { eventId: event.value.id })
}

function openCreatePrinter() {
  if (!event.value) return
  open('create', 'posPrinters', [], 'slideover', { eventId: event.value.id })
}

function openCreateHelper() {
  if (!event.value) return
  open('create', 'posHelpers', [], 'slideover', { eventId: event.value.id })
}

async function loadReceiptSettings() {
  if (!event.value) return
  if (import.meta.server) return // Skip on server - only needed client-side
  try {
    const teamId = route.params.team as string
    const data = await $fetch<ReceiptSettings>(
      `/api/teams/${teamId}/pos-eventsettings/receipt-settings/${event.value.id}`,
    )
    receiptSettings.value = data
  } catch (error) {
    console.error('Error loading receipt settings:', error)
  }
}

function openPrinterPreview(printer: any) {
  selectedPrinter.value = printer
  showPrinterPreview.value = true
}

async function duplicateEvent() {
  if (!event.value) return
  duplicating.value = true
  try {
    const teamId = route.params.team as string
    const response = await $fetch(`/api/teams/${teamId}/pos-events/${event.value.id}/duplicate`, {
      method: 'POST',
    })
    if (response && typeof response === 'object' && 'slug' in response) {
      router.push(`/dashboard/${teamId}/events/${response.slug}`)
    }
  } finally {
    duplicating.value = false
  }
}
</script>
