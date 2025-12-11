<template>
  <UCard class="flex flex-col h-full" :ui="{ root: 'rounded-none', body: 'flex-1 overflow-y-auto', footer: 'space-y-4' }">
    <!-- Cart items -->
    <p v-if="items.length === 0" class="text-center text-muted py-8">
      Cart is empty
    </p>

    <div v-else class="space-y-2">
      <div
        v-for="(item, index) in items"
        :key="`${item.product.id}-${index}`"
        class="flex items-center justify-between gap-2 py-2"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">{{ item.product.title }}</p>
          <p v-if="formatSelectedOptions(item)" class="text-xs text-info truncate">{{ formatSelectedOptions(item) }}</p>
          <p v-if="item.remarks" class="text-xs text-muted truncate">{{ item.remarks }}</p>
          <p class="text-sm text-muted">${{ calculateItemPrice(item).toFixed(2) }} each</p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-minus"
            size="sm"
            color="neutral"
            variant="soft"
            square
            @click="$emit('updateQuantity', index, item.quantity - 1)"
          />
          <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
          <UButton
            icon="i-lucide-plus"
            size="sm"
            color="neutral"
            variant="soft"
            square
            @click="$emit('updateQuantity', index, item.quantity + 1)"
          />
          <UButton
            icon="i-lucide-x"
            size="sm"
            color="error"
            variant="ghost"
            square
            @click="$emit('remove', index)"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold">Total</span>
          <UBadge v-if="items.length > 0" :label="items.length" size="sm" />
        </div>
        <span class="text-2xl font-bold">${{ total.toFixed(2) }}</span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <UButton
          label="Clear"
          color="neutral"
          variant="soft"
          size="lg"
          block
          :disabled="items.length === 0"
          @click="$emit('clear')"
        />
        <UButton
          label="Pay"
          size="lg"
          block
          :disabled="disabled || items.length === 0 || (clientRequired && !hasClient)"
          @click="$emit('checkout')"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
// Inline product option structure (stored in product.options JSON field)
interface ProductOption {
  id: string
  label: string
  priceModifier: number
}

interface CartItem {
  product: {
    id: string
    title: string
    price: number
    options?: ProductOption[]
  }
  quantity: number
  remarks?: string
  selectedOptions?: string | string[]
}

defineProps<{
  items: CartItem[]
  total: number
  disabled: boolean
  clientRequired?: boolean
  hasClient?: boolean
}>()

defineEmits<{
  updateQuantity: [index: number, quantity: number]
  remove: [index: number]
  checkout: []
  clear: []
}>()

// Format selected options for display
function formatSelectedOptions(item: CartItem): string {
  if (!item.selectedOptions || !item.product.options) return ''
  const optionIds = Array.isArray(item.selectedOptions)
    ? item.selectedOptions
    : [item.selectedOptions]
  return optionIds
    .map(id => item.product.options?.find(o => o.id === id)?.label)
    .filter(Boolean)
    .join(', ')
}

// Calculate item price including option modifiers
function calculateItemPrice(item: CartItem): number {
  let price = Number(item.product.price)
  if (item.selectedOptions && item.product.options) {
    const optionIds = Array.isArray(item.selectedOptions)
      ? item.selectedOptions
      : [item.selectedOptions]
    for (const id of optionIds) {
      const option = item.product.options.find(o => o.id === id)
      if (option?.priceModifier) {
        price += option.priceModifier
      }
    }
  }
  return price
}
</script>
