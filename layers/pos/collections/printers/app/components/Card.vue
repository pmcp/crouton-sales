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
  <UCard>
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <UIcon name="i-lucide-printer" class="size-5 text-primary shrink-0" />
          <div class="min-w-0">
            <h3 class="font-semibold truncate">{{ item.title }}</h3>
            <p class="text-sm text-muted font-mono">{{ connectionString }}</p>
          </div>
        </div>
        <UBadge :color="item.isActive !== false ? 'success' : 'neutral'" variant="subtle" size="xs">
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
  </UCard>
</template>
