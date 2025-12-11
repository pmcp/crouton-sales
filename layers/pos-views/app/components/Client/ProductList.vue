<template>
  <div v-if="products.length === 0" class="text-center text-muted py-8">
    No products found
  </div>
  <div v-else ref="containerRef" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
    <div v-for="product in products" :key="product.id" class="relative">
      <!-- Product button -->
      <UButton
        color="neutral"
        variant="soft"
        size="xl"
        class="w-full h-auto py-4 flex-col items-start relative"
        :class="{ 'ring-2 ring-primary': activeProductId === product.id }"
        @click="handleProductClick(product)"
      >
        <span class="font-medium">{{ product.title }}</span>
        <span class="text-primary font-bold">${{ Number(product.price).toFixed(2) }}</span>
        <UIcon v-if="hasOptions(product)" name="i-lucide-list" class="absolute top-2 right-2 text-muted text-xs" />
      </UButton>

      <!-- Desktop: Overlay options (two-tap flow) -->
      <div
        v-if="activeProductId === product.id && hasOptions(product)"
        class="hidden lg:block absolute z-10 top-full left-0 right-0 mt-1 bg-[var(--ui-bg)] border border-[var(--ui-border)] rounded-lg shadow-lg p-2"
      >
        <div class="grid grid-cols-1 gap-1">
          <UButton
            v-for="option in getOptions(product)"
            :key="option.id"
            size="sm"
            color="neutral"
            variant="soft"
            class="justify-between"
            @click.stop="selectOption(product, option.id)"
          >
            <span>{{ option.label }}</span>
            <span v-if="option.priceModifier > 0" class="text-xs text-muted">+${{ option.priceModifier.toFixed(2) }}</span>
          </UButton>
        </div>
      </div>

      <!-- Mobile: Inline expansion -->
      <div
        v-if="activeProductId === product.id && hasOptions(product)"
        class="lg:hidden mt-1 bg-[var(--ui-bg-muted)] rounded-lg p-2"
      >
        <div class="grid grid-cols-1 gap-1">
          <UButton
            v-for="option in getOptions(product)"
            :key="option.id"
            size="sm"
            color="neutral"
            variant="soft"
            class="justify-between"
            @click.stop="selectOption(product, option.id)"
          >
            <span>{{ option.label }}</span>
            <span v-if="option.priceModifier > 0" class="text-xs text-muted">+${{ option.priceModifier.toFixed(2) }}</span>
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PosProduct } from '~~/layers/pos/collections/products/types'

interface ProductOption {
  id: string
  label: string
  priceModifier: number
}

defineProps<{
  products: PosProduct[]
}>()

const emit = defineEmits<{
  select: [product: PosProduct, selectedOption?: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
const activeProductId = ref<string | null>(null)

function hasOptions(product: PosProduct): boolean {
  return !!product.hasOptions && Array.isArray(product.options) && product.options.length > 0
}

function getOptions(product: PosProduct): ProductOption[] {
  return (product.options || []) as ProductOption[]
}

function handleProductClick(product: PosProduct) {
  if (hasOptions(product)) {
    // Toggle expansion/active state
    activeProductId.value = activeProductId.value === product.id ? null : product.id
  }
  else {
    // No options, add directly
    emit('select', product)
  }
}

function selectOption(product: PosProduct, optionId: string) {
  emit('select', product, optionId)
  activeProductId.value = null
}

// Close on click outside
onClickOutside(containerRef, () => {
  activeProductId.value = null
})
</script>
