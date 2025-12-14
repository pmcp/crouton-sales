<script setup lang="ts">
import type { PosHelper } from '../../types'

interface Props {
  item: PosHelper
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

const isExpired = computed(() => {
  if (!props.item.expiresAt) return false
  return new Date(props.item.expiresAt) < new Date()
})

const statusColor = computed(() => {
  if (isExpired.value) return 'error'
  return props.item.isActive !== false ? 'success' : 'neutral'
})

const statusText = computed(() => {
  if (isExpired.value) return 'Expired'
  return props.item.isActive !== false ? 'Active' : 'Inactive'
})
</script>

<template>
  <UCard>
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <UIcon name="i-lucide-user" class="size-5 text-primary shrink-0" />
          <h3 class="font-semibold truncate">{{ item.title }}</h3>
        </div>
        <UBadge :color="statusColor" variant="subtle" size="xs">
          {{ statusText }}
        </UBadge>
      </div>

      <div class="flex flex-wrap gap-4 text-sm text-muted">
        <div v-if="item.expiresAt" class="flex items-center gap-1">
          <UIcon name="i-lucide-clock" class="size-3" />
          <span>Expires:</span>
          <CroutonDate :date="item.expiresAt" />
        </div>
        <div v-if="item.lastActiveAt" class="flex items-center gap-1">
          <UIcon name="i-lucide-activity" class="size-3" />
          <span>Last active:</span>
          <CroutonDate :date="item.lastActiveAt" />
        </div>
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
