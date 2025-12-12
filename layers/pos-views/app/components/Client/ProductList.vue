<template>
  <div v-if="products.length === 0" class="text-center text-muted py-8">
    No products found
  </div>
  <div v-else ref="containerRef" class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2">
    <div v-for="product in products" :key="product.id">
      <div
        class="rounded-lg bg-elevated p-4 cursor-pointer transition-colors"
        :class="activeProductId === product.id ? 'ring-2 ring-primary' : 'hover:bg-accented'"
        @click="handleProductClick(product)"
      >
        <!-- Product header -->
        <div class="flex justify-between items-start">
          <div>
            <div class="font-medium">{{ product.title }}</div>
            <div class="text-primary font-bold">${{ Number(product.price).toFixed(2) }}</div>
          </div>
          <UIcon v-if="hasOptions(product)" name="i-lucide-chevron-down" class="text-muted size-4 transition-transform" :class="{ 'rotate-180': activeProductId === product.id }" />
        </div>

        <!-- Options (inside card) -->
        <div
          v-if="activeProductId === product.id && hasOptions(product)"
          class="mt-3 pt-3 border-t border-muted space-y-2"
          @click.stop
        >
          <!-- Multi-select mode -->
          <template v-if="isMultiSelect(product)">
            <UCheckbox
              v-for="option in getOptions(product)"
              :key="option.id"
              :model-value="isOptionSelected(product.id, option.id)"
              @update:model-value="toggleOption(product.id, option.id)"
            >
              <template #label>
                <span class="flex items-center justify-between w-full">
                  <span>{{ option.label }}</span>
                  <span v-if="option.priceModifier > 0" class="text-xs text-muted ml-2">+${{ option.priceModifier.toFixed(2) }}</span>
                </span>
              </template>
            </UCheckbox>
            <UButton
              block
              size="sm"
              color="primary"
              class="mt-2"
              @click="confirmMultiOptions(product)"
            >
              Add to Cart
            </UButton>
          </template>

          <!-- Single-select mode -->
          <template v-else>
            <UButton
              v-for="option in getOptions(product)"
              :key="option.id"
              block
              size="sm"
              color="neutral"
              variant="soft"
              class="justify-between"
              @click="selectOption(product, option.id)"
            >
              <span>{{ option.label }}</span>
              <span v-if="option.priceModifier > 0" class="text-xs text-muted">+${{ option.priceModifier.toFixed(2) }}</span>
            </UButton>
          </template>
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
  select: [product: PosProduct, selectedOption?: string | string[]]
}>()

const containerRef = ref<HTMLElement | null>(null)
const activeProductId = ref<string | null>(null)
const selectedOptionIds = ref<Map<string, string[]>>(new Map())

function hasOptions(product: PosProduct): boolean {
  return !!product.hasOptions && Array.isArray(product.options) && product.options.length > 0
}

function isMultiSelect(product: PosProduct): boolean {
  return !!product.multipleOptionsAllowed
}

function getOptions(product: PosProduct): ProductOption[] {
  return (product.options || []) as ProductOption[]
}

function isOptionSelected(productId: string, optionId: string): boolean {
  const selected = selectedOptionIds.value.get(productId)
  return selected?.includes(optionId) ?? false
}

function toggleOption(productId: string, optionId: string) {
  const current = selectedOptionIds.value.get(productId) || []
  if (current.includes(optionId)) {
    selectedOptionIds.value.set(productId, current.filter(id => id !== optionId))
  }
  else {
    selectedOptionIds.value.set(productId, [...current, optionId])
  }
}

function confirmMultiOptions(product: PosProduct) {
  const selected = selectedOptionIds.value.get(product.id) || []
  emit('select', product, selected.length > 0 ? selected : undefined)
  selectedOptionIds.value.delete(product.id)
  activeProductId.value = null
}

function handleProductClick(product: PosProduct) {
  if (hasOptions(product)) {
    // Clear previous selection if switching products
    if (activeProductId.value && activeProductId.value !== product.id) {
      selectedOptionIds.value.delete(activeProductId.value)
    }
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
  if (activeProductId.value) {
    selectedOptionIds.value.delete(activeProductId.value)
  }
  activeProductId.value = null
})
</script>
