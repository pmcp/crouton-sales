<script setup lang="ts">
import type { PosProduct } from '../../types'

interface Props {
  item: PosProduct
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

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(props.item.price)
})
</script>

<template>
  <UCard>
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold truncate">{{ item.title }}</h3>
          <p v-if="item.description" class="text-sm text-muted line-clamp-2 mt-1">
            {{ item.description }}
          </p>
        </div>
        <UBadge :color="item.isActive !== false ? 'success' : 'neutral'" variant="subtle" size="xs">
          {{ item.isActive !== false ? 'Active' : 'Inactive' }}
        </UBadge>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-lg font-bold text-primary">{{ formattedPrice }}</span>
        <CroutonItemCardMini
          v-if="item.categoryId"
          :id="item.categoryId"
          collection="posCategories"
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
