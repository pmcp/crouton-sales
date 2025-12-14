<script setup lang="ts">
import type { PosCategorie } from '../../types'

interface Props {
  item: PosCategorie
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
        <UIcon name="i-lucide-folder" class="size-5 text-primary shrink-0" />
        <div class="min-w-0">
          <h3 class="font-semibold truncate">{{ item.title }}</h3>
          <p v-if="item.displayOrder" class="text-sm text-muted">
            Order: {{ item.displayOrder }}
          </p>
        </div>
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
