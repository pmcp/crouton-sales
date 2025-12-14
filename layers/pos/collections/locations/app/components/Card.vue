<script setup lang="ts">
import type { PosLocation } from '../../types'

interface Props {
  item: PosLocation
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
</script>

<template>
  <UCard>
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <UIcon name="i-lucide-map-pin" class="size-5 text-primary shrink-0" />
        <h3 class="font-semibold truncate">{{ item.title }}</h3>
      </div>
      <CroutonItemButtonsMini
        update
        delete
        @update="handleUpdate"
        @delete="handleDelete"
      />
    </div>
  </UCard>
</template>
