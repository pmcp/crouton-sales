<script setup lang="ts">
import type { PosPrinter } from '../../types'

interface Props {
  item: PosPrinter
  layout: 'list' | 'grid' | 'cards'
  collection: string
}

const props = defineProps<Props>()
const { open } = useCrouton()

function handleUpdate() {
  open('update', props.collection, [props.item.id])
}

function handleDelete() {
  open('delete', props.collection, [props.item.id])
}

const connectionString = computed(() => {
  return props.item.port
    ? `${props.item.ipAddress}:${props.item.port}`
    : props.item.ipAddress
})
</script>

<template>
  <UCard variant="soft">
    <div class="flex gap-3">
      <UAvatar icon="i-lucide-printer" size="lg" />

      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <h3 class="font-semibold truncate">{{ item.title }}</h3>
            <p class="text-sm text-muted font-mono">{{ connectionString }}</p>
          </div>
          <UBadge
            :color="item.isActive !== false ? 'success' : 'neutral'"
            :icon="item.isActive !== false ? 'i-lucide-wifi' : 'i-lucide-wifi-off'"
            variant="subtle"
            size="sm"
          >
            {{ item.isActive !== false ? 'Online' : 'Offline' }}
          </UBadge>
        </div>

        <div v-if="item.locationId" class="flex items-center gap-2">
          <span class="text-xs text-muted">Location:</span>
          <CroutonItemCardMini
            :id="item.locationId"
            collection="posLocations"
          />
        </div>

        <div class="flex justify-end pt-2 border-t border-default">
          <CroutonItemButtonsMini
            update
            delete
            @update="handleUpdate"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
