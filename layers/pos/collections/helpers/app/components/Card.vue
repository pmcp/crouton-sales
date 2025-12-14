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
  <UCard variant="soft">
    <div class="flex gap-3">
      <UAvatar icon="i-lucide-user" size="lg" />

      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-semibold truncate">{{ item.title }}</h3>
          <UBadge :color="statusColor" variant="subtle" size="sm">
            {{ statusText }}
          </UBadge>
        </div>

        <div class="flex flex-wrap gap-3">
          <UBadge v-if="item.expiresAt" color="neutral" variant="subtle" icon="i-lucide-clock" size="sm">
            Expires: <CroutonDate :date="item.expiresAt" />
          </UBadge>
          <UBadge v-if="item.lastActiveAt" color="neutral" variant="subtle" icon="i-lucide-activity" size="sm">
            Last active: <CroutonDate :date="item.lastActiveAt" />
          </UBadge>
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
