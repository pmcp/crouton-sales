<template>
  <div class="h-full flex flex-col p-4">
    <h2 class="text-lg font-bold mb-4">Cart</h2>

    <div v-if="items.length === 0" class="flex-1 flex items-center justify-center text-gray-500">
      Cart is empty
    </div>

    <div v-else class="flex-1 overflow-y-auto space-y-3">
      <div
        v-for="item in items"
        :key="item.product.id"
        class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
      >
        <div class="flex-1 min-w-0">
          <div class="font-medium truncate">{{ item.product.title }}</div>
          <div class="text-sm text-gray-500">${{ Number(item.product.price).toFixed(2) }}</div>
        </div>

        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-minus"
            size="xs"
            variant="ghost"
            @click="$emit('updateQuantity', item.product.id, item.quantity - 1)"
          />
          <span class="w-8 text-center">{{ item.quantity }}</span>
          <UButton
            icon="i-lucide-plus"
            size="xs"
            variant="ghost"
            @click="$emit('updateQuantity', item.product.id, item.quantity + 1)"
          />
        </div>

        <UButton
          icon="i-lucide-trash-2"
          size="xs"
          color="red"
          variant="ghost"
          @click="$emit('remove', item.product.id)"
        />
      </div>
    </div>

    <div class="border-t pt-4 mt-4 space-y-3">
      <div class="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>${{ total.toFixed(2) }}</span>
      </div>

      <div class="flex gap-2">
        <UButton
          variant="ghost"
          class="flex-1"
          :disabled="items.length === 0"
          @click="$emit('clear')"
        >
          Clear
        </UButton>
        <UButton
          class="flex-1"
          :disabled="disabled || items.length === 0"
          @click="$emit('checkout')"
        >
          Checkout
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from '../../composables/usePosOrder'

defineProps<{
  items: CartItem[]
  total: number
  disabled: boolean
}>()

defineEmits<{
  updateQuantity: [productId: string, quantity: number]
  remove: [productId: string]
  checkout: []
  clear: []
}>()
</script>
