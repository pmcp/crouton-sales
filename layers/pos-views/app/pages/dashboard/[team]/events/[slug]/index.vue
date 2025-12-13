<template>
  <div v-if="!event" class="flex items-center justify-center h-full">
    <div class="text-center">
      <UIcon name="i-lucide-alert-circle" class="text-4xl text-gray-400 mb-2" />
      <p class="text-gray-500">Event not found</p>
    </div>
  </div>

  <div v-else class="p-6 space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold">{{ event.title }}</h1>
        <p class="text-gray-500 mt-1">
          {{ event.eventType }}
          <span v-if="event.startDate"> &middot; {{ formatDate(event.startDate) }}</span>
          <span v-if="event.endDate"> - {{ formatDate(event.endDate) }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <CroutonSlideover collection="posEvents" :id="event.id">
          <UButton variant="outline" icon="i-lucide-pencil">
            Edit
          </UButton>
        </CroutonSlideover>
        <UButton
          variant="outline"
          icon="i-lucide-copy"
          :loading="duplicating"
          @click="duplicateEvent"
        >
          Duplicate
        </UButton>
      </div>
    </div>

    <!-- Settings Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Client Mode Setting -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Client Selection Mode</h2>
        </template>
        <USwitch
          v-model="useReusableClients"
          label="Use Reusable Clients"
          description="When enabled, orders will select from a list of existing clients. When disabled, a free-text name field is shown instead."
          :loading="savingClientMode"
          @update:model-value="saveClientModeSetting"
        />
      </UCard>

      <!-- Helper PIN Setting -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Helper Authentication</h2>
        </template>
        <div class="space-y-4">
          <UFormField label="Helper PIN" description="A PIN code that helpers will use to log in to the POS interface">
            <UInput
              v-model="helperPin"
              type="text"
              placeholder="Enter PIN (e.g., 1234)"
              :ui="{ base: 'font-mono' }"
            />
          </UFormField>
          <UButton
            color="primary"
            size="sm"
            :loading="savingHelperPin"
            :disabled="helperPin === originalHelperPin"
            @click="saveHelperPin"
          >
            Save PIN
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Entity Lists -->
    <div class="space-y-6">
      <!-- Locations -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Locations</h2>
        </template>
        <div v-if="locationsPending" class="p-6 text-center text-muted">
          Loading locations...
        </div>
        <CroutonCollection
          v-else-if="locations && locations.length > 0"
          layout="table"
          collection="posLocations"
          :columns="locationColumns"
          :rows="locations"
          create
        >
          <template #eventId-cell="{ row }">
            <CroutonItemCardMini
              v-if="row.original.eventId"
              :id="row.original.eventId"
              collection="posEvents"
            />
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No locations yet</p>
          <CroutonSlideover collection="posLocations" :defaults="{ eventId: event.id }">
            <UButton size="sm" variant="outline" class="mt-2">Add Location</UButton>
          </CroutonSlideover>
        </div>
      </UCard>

      <!-- Categories -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Categories</h2>
        </template>
        <div v-if="categoriesPending" class="p-6 text-center text-muted">
          Loading categories...
        </div>
        <CroutonCollection
          v-else-if="categories && categories.length > 0"
          layout="table"
          collection="posCategories"
          :columns="categoryColumns"
          :rows="categories"
          create
        >
          <template #eventId-cell="{ row }">
            <CroutonItemCardMini
              v-if="row.original.eventId"
              :id="row.original.eventId"
              collection="posEvents"
            />
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No categories yet</p>
          <CroutonSlideover collection="posCategories" :defaults="{ eventId: event.id }">
            <UButton size="sm" variant="outline" class="mt-2">Add Category</UButton>
          </CroutonSlideover>
        </div>
      </UCard>

      <!-- Products -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Products</h2>
        </template>
        <div v-if="productsPending" class="p-6 text-center text-muted">
          Loading products...
        </div>
        <CroutonCollection
          v-else-if="products && products.length > 0"
          layout="table"
          collection="posProducts"
          :columns="productColumns"
          :rows="products"
          create
        >
          <template #eventId-cell="{ row }">
            <CroutonItemCardMini
              v-if="row.original.eventId"
              :id="row.original.eventId"
              collection="posEvents"
            />
          </template>
          <template #categoryId-cell="{ row }">
            <CroutonItemCardMini
              v-if="row.original.categoryId"
              :id="row.original.categoryId"
              collection="posCategories"
            />
          </template>
          <template #locationId-cell="{ row }">
            <CroutonItemCardMini
              v-if="row.original.locationId"
              :id="row.original.locationId"
              collection="posLocations"
            />
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No products yet</p>
          <CroutonSlideover collection="posProducts" :defaults="{ eventId: event.id }">
            <UButton size="sm" variant="outline" class="mt-2">Add Product</UButton>
          </CroutonSlideover>
        </div>
      </UCard>

      <!-- Printers -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Printers</h2>
        </template>
        <div v-if="printersPending" class="p-6 text-center text-muted">
          Loading printers...
        </div>
        <CroutonCollection
          v-else-if="printers && printers.length > 0"
          layout="table"
          collection="posPrinters"
          :columns="printerColumns"
          :rows="printers"
          create
        >
          <template #eventId-cell="{ row }">
            <CroutonItemCardMini
              v-if="row.original.eventId"
              :id="row.original.eventId"
              collection="posEvents"
            />
          </template>
          <template #locationId-cell="{ row }">
            <CroutonItemCardMini
              v-if="row.original.locationId"
              :id="row.original.locationId"
              collection="posLocations"
            />
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No printers yet</p>
          <CroutonSlideover collection="posPrinters" :defaults="{ eventId: event.id }">
            <UButton size="sm" variant="outline" class="mt-2">Add Printer</UButton>
          </CroutonSlideover>
        </div>
      </UCard>

      <!-- Helpers -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Helpers</h2>
        </template>
        <div v-if="helpersPending" class="p-6 text-center text-muted">
          Loading helpers...
        </div>
        <CroutonCollection
          v-else-if="helpers && helpers.length > 0"
          layout="table"
          collection="posHelpers"
          :columns="helperColumns"
          :rows="helpers"
          create
        >
          <template #eventId-cell="{ row }">
            <CroutonItemCardMini
              v-if="row.original.eventId"
              :id="row.original.eventId"
              collection="posEvents"
            />
          </template>
          <template #expiresAt-cell="{ row }">
            <CroutonDate :date="row.original.expiresAt" />
          </template>
          <template #lastActiveAt-cell="{ row }">
            <CroutonDate :date="row.original.lastActiveAt" />
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No helpers yet</p>
          <CroutonSlideover collection="posHelpers" :defaults="{ eventId: event.id }">
            <UButton size="sm" variant="outline" class="mt-2">Add Helper</UButton>
          </CroutonSlideover>
        </div>
      </UCard>
    </div>

    <!-- CTA -->
    <div class="flex justify-center pt-4">
      <UButton
        size="xl"
        icon="i-lucide-shopping-cart"
        :to="`/pos?event=${event.slug}`"
      >
        Start Taking Orders
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PosEvent } from '~~/layers/pos/collections/events/types'
import type { PosEventSetting } from '~~/layers/pos/collections/eventsettings/types'
import usePosLocations from '~~/layers/pos/collections/locations/app/composables/usePosLocations'
import usePosCategories from '~~/layers/pos/collections/categories/app/composables/usePosCategories'
import usePosProducts from '~~/layers/pos/collections/products/app/composables/usePosProducts'
import usePosPrinters from '~~/layers/pos/collections/printers/app/composables/usePosPrinters'
import usePosHelpers from '~~/layers/pos/collections/helpers/app/composables/usePosHelpers'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const eventSlug = computed(() => route.params.slug as string)

// Column definitions from composables
const { columns: locationColumns } = usePosLocations()
const { columns: categoryColumns } = usePosCategories()
const { columns: productColumns } = usePosProducts()
const { columns: printerColumns } = usePosPrinters()
const { columns: helperColumns } = usePosHelpers()

// Fetch events and find the one matching the slug
const { items: events } = await useCollectionQuery('posEvents')

const event = computed(() =>
  (events.value as PosEvent[] | null)?.find(e => e.slug === eventSlug.value),
)

// Query for event-scoped data
const eventQuery = computed(() => event.value ? { eventId: event.value.id } : {})

// Fetch entity data at page level
const { items: locations, pending: locationsPending } = await useCollectionQuery('posLocations', { query: eventQuery })
const { items: categories, pending: categoriesPending } = await useCollectionQuery('posCategories', { query: eventQuery })
const { items: products, pending: productsPending } = await useCollectionQuery('posProducts', { query: eventQuery })
const { items: printers, pending: printersPending } = await useCollectionQuery('posPrinters', { query: eventQuery })
const { items: helpers, pending: helpersPending } = await useCollectionQuery('posHelpers', { query: eventQuery })

// Fetch event settings
const { items: allSettings, refresh: refreshSettings } = await useCollectionQuery('posEventSettings')

// Filter settings for this event
const eventSettings = computed(() =>
  (allSettings.value as PosEventSetting[] | null)?.filter(s => s.eventId === event.value?.id) || [],
)

// Find the use_reusable_clients setting
const clientModeSetting = computed(() =>
  eventSettings.value.find(s => s.settingKey === 'use_reusable_clients'),
)

// Client mode state
const useReusableClients = ref(false)
const savingClientMode = ref(false)

// Helper PIN state
const helperPin = ref('')
const originalHelperPin = ref('')
const savingHelperPin = ref(false)

// Duplicate state
const duplicating = ref(false)

// Initialize values when event and settings load
watch([event, eventSettings], () => {
  if (event.value) {
    // Initialize helper PIN
    helperPin.value = event.value.helperPin || ''
    originalHelperPin.value = event.value.helperPin || ''
  }

  if (clientModeSetting.value) {
    useReusableClients.value = clientModeSetting.value.settingValue === 'true'
  }
}, { immediate: true })

// Format date helper
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

// Save client mode setting
async function saveClientModeSetting(value: boolean) {
  if (!event.value) return

  savingClientMode.value = true

  try {
    const { create, update } = useCollectionMutation('posEventSettings')

    if (clientModeSetting.value) {
      await update(clientModeSetting.value.id, {
        settingValue: String(value),
      })
    }
    else {
      await create({
        eventId: event.value.id,
        settingKey: 'use_reusable_clients',
        settingValue: String(value),
        description: 'Whether to use reusable clients or free-text names',
      })
    }

    await refreshSettings()
  }
  catch (error) {
    // Revert the switch on error
    useReusableClients.value = !value
  }
  finally {
    savingClientMode.value = false
  }
}

// Save helper PIN
async function saveHelperPin() {
  if (!event.value) return

  savingHelperPin.value = true

  try {
    const { update } = useCollectionMutation('posEvents')

    await update(event.value.id, {
      helperPin: helperPin.value || undefined,
    })

    originalHelperPin.value = helperPin.value
  }
  finally {
    savingHelperPin.value = false
  }
}

// Duplicate event
async function duplicateEvent() {
  if (!event.value) return

  duplicating.value = true

  try {
    const teamId = route.params.team as string
    const response = await $fetch(`/api/teams/${teamId}/pos-events/${event.value.id}/duplicate`, {
      method: 'POST',
    })

    // Navigate to the new event
    if (response && typeof response === 'object' && 'slug' in response) {
      router.push(`/dashboard/${teamId}/events/${response.slug}`)
    }
  }
  finally {
    duplicating.value = false
  }
}
</script>
