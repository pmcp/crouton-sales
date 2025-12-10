<template>
  <div v-if="!event" class="flex items-center justify-center h-full">
    <div class="text-center">
      <UIcon name="i-lucide-alert-circle" class="text-4xl text-gray-400 mb-2" />
      <p class="text-gray-500">Event not found</p>
    </div>
  </div>

  <div v-else class="p-6 max-w-2xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">{{ event.title }} Settings</h1>
      <p class="text-gray-500 mt-1">Configure settings for this event</p>
    </div>

    <div class="space-y-6">
      <!-- Client Mode Setting -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Client Selection Mode</h2>
        </template>

        <div class="space-y-4">
          <USwitch
            v-model="useReusableClients"
            label="Use Reusable Clients"
            description="When enabled, orders will select from a list of existing clients. When disabled, a free-text name field is shown instead."
            :loading="savingClientMode"
            @update:model-value="saveClientModeSetting"
          />
        </div>
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
            :loading="savingHelperPin"
            :disabled="helperPin === originalHelperPin"
            @click="saveHelperPin"
          >
            Save PIN
          </UButton>
        </div>
      </UCard>

      <!-- Navigation Links -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Event Management</h2>
        </template>

        <div class="grid grid-cols-2 gap-3">
          <UButton
            variant="outline"
            icon="i-lucide-shopping-cart"
            :to="`/dashboard/${route.params.team}/pos/${eventSlug}/orders`"
          >
            Orders
          </UButton>
          <UButton
            variant="outline"
            icon="i-lucide-package"
            :to="`/dashboard/${route.params.team}/pos/products`"
          >
            Products
          </UButton>
          <UButton
            variant="outline"
            icon="i-lucide-folder"
            :to="`/dashboard/${route.params.team}/pos/categories`"
          >
            Categories
          </UButton>
          <UButton
            variant="outline"
            icon="i-lucide-map-pin"
            :to="`/dashboard/${route.params.team}/pos/locations`"
          >
            Locations
          </UButton>
          <UButton
            variant="outline"
            icon="i-lucide-printer"
            :to="`/dashboard/${route.params.team}/pos/printers`"
          >
            Printers
          </UButton>
          <UButton
            variant="outline"
            icon="i-lucide-users"
            :to="`/dashboard/${route.params.team}/pos/helpers`"
          >
            Helpers
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PosEvent } from '~~/layers/pos/collections/events/types'
import type { PosEventSetting } from '~~/layers/pos/collections/eventsettings/types'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const eventSlug = computed(() => route.params.eventSlug as string)

// Fetch events and find the one matching the slug
const { items: events } = await useCollectionQuery('posEvents')

const event = computed(() =>
  (events.value as PosEvent[] | null)?.find(e => e.slug === eventSlug.value),
)

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
</script>
