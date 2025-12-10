<template>
  <div v-if="products.length === 0" class="text-center text-muted py-8">
    No products found
  </div>
  <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
    <UButton
      v-for="product in products"
      :key="product.id"
      color="neutral"
      variant="soft"
      size="xl"
      class="h-auto py-4 flex-col items-start"
      @click="$emit('select', product)"
    >
      <span class="font-medium">{{ product.title }}</span>
      <span class="text-primary font-bold">${{ Number(product.price).toFixed(2) }}</span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { PosProduct } from '~~/layers/pos/collections/products/types'

defineProps<{
  products: PosProduct[]
}>()

defineEmits<{
  select: [product: PosProduct]
}>()
</script>
