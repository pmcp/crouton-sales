<template>
  <div v-if="!event" class="flex items-center justify-center h-full">
    <div class="text-center">
      <UIcon name="i-lucide-alert-circle" class="text-4xl text-gray-400 mb-2" />
      <p class="text-gray-500">Event not found</p>
    </div>
  </div>
  <ClientOrderInterface v-else :event-id="event.id" />
</template>

<script setup lang="ts">
import type { PosEvent } from '~~/layers/pos/collections/events/types'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const eventSlug = computed(() => route.params.eventSlug as string)

// Fetch events and find the one matching the slug
const { items: events } = await useCollectionQuery('posEvents')

const event = computed(() =>
  (events.value as PosEvent[] | null)?.find(e => e.slug === eventSlug.value),
)
</script>
