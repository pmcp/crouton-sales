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
        <UButton variant="outline" icon="i-lucide-pencil" @click="openEditEvent">
          Edit
        </UButton>
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
          layout="grid"
          collection="posLocations"
          :rows="locations"
        >
          <template #header>
            <div class="flex justify-end p-2">
              <UButton color="primary" size="sm" @click="openCreateLocation">
                Create Location
              </UButton>
            </div>
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No locations yet</p>
          <UButton size="sm" variant="outline" class="mt-2" @click="openCreateLocation">Add Location</UButton>
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
          layout="grid"
          collection="posCategories"
          :rows="categories"
        >
          <template #header>
            <div class="flex justify-end p-2">
              <UButton color="primary" size="sm" @click="openCreateCategory">
                Create Category
              </UButton>
            </div>
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No categories yet</p>
          <UButton size="sm" variant="outline" class="mt-2" @click="openCreateCategory">Add Category</UButton>
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
          layout="grid"
          collection="posProducts"
          :rows="products"
        >
          <template #header>
            <div class="flex justify-end p-2">
              <UButton color="primary" size="sm" @click="openCreateProduct">
                Create Product
              </UButton>
            </div>
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No products yet</p>
          <UButton size="sm" variant="outline" class="mt-2" @click="openCreateProduct">Add Product</UButton>
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
          layout="grid"
          collection="posPrinters"
          :rows="printers"
        >
          <template #header>
            <div class="flex justify-end p-2">
              <UButton color="primary" size="sm" @click="openCreatePrinter">
                Create Printer
              </UButton>
            </div>
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No printers yet</p>
          <UButton size="sm" variant="outline" class="mt-2" @click="openCreatePrinter">Add Printer</UButton>
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
          layout="grid"
          collection="posHelpers"
          :rows="helpers"
        >
          <template #header>
            <div class="flex justify-end p-2">
              <UButton color="primary" size="sm" @click="openCreateHelper">
                Create Helper
              </UButton>
            </div>
          </template>
        </CroutonCollection>
        <div v-else class="p-6 text-center text-muted">
          <p>No helpers yet</p>
          <UButton size="sm" variant="outline" class="mt-2" @click="openCreateHelper">Add Helper</UButton>
        </div>
      </UCard>
    </div>

    <!-- CTA -->
    <div class="flex justify-center pt-4">
      <UButton
        size="xl"
        icon="i-lucide-shopping-cart"
        :to="`/order/${route.params.team}/${event.slug}`"
      >
        Start Taking Orders
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PosEvent } from '~~/layers/pos/collections/events/types'
import type { PosEventSetting } from '~~/layers/pos/collections/eventsettings/types'

definePageMeta({ middleware: ['auth'] })

// Crouton form management
const { open } = useCrouton()

const route = useRoute()
const router = useRouter()
const eventSlug = computed(() => route.params.slug as string)


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

// Edit event function
function openEditEvent() {
  if (!event.value) return
  open('update', 'posEvents', [event.value.id])
}

// Create entity functions with eventId pre-filled
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
