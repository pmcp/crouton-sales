<template>
  <div class="flex gap-2 overflow-x-auto pb-2">
    <UButton
      :variant="modelValue === null ? 'solid' : 'ghost'"
      @click="$emit('update:modelValue', null)"
    >
      All ({{ totalCount }})
    </UButton>
    <UButton
      v-for="cat in categories"
      :key="cat.id"
      :variant="modelValue === cat.id ? 'solid' : 'ghost'"
      @click="$emit('update:modelValue', cat.id)"
    >
      {{ cat.title }} ({{ productCounts[cat.id] || 0 }})
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { PosCategory } from '~~/layers/pos/collections/categories/types'

const props = defineProps<{
  categories: PosCategory[]
  modelValue: string | null
  productCounts: Record<string, number>
}>()

defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const totalCount = computed(() =>
  Object.values(props.productCounts).reduce((sum, count) => sum + count, 0),
)
</script>
