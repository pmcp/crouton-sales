<template>
  <div v-if="products.length === 0" class="text-center text-gray-500 py-8">
    No products found
  </div>
  <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <UCard
      v-for="product in products"
      :key="product.id"
      class="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
      @click="$emit('select', product)"
    >
      <div class="font-medium">{{ product.title }}</div>
      <div class="text-lg font-bold text-primary">${{ Number(product.price).toFixed(2) }}</div>
    </UCard>
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
