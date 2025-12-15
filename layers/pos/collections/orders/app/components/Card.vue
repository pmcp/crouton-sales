<script setup lang="ts">
import type { PosOrder } from '../../types'
import type { PosOrderItem } from '../../../orderitems/types'

interface Props {
  item: PosOrder & {
    ownerUser?: { id: string; name: string }
    clientIdData?: { id: string; title: string }
  }
  layout: 'list' | 'grid' | 'cards'
  collection: string
}

const props = defineProps<Props>()
const { open } = useCrouton()
const { update } = useCollectionMutation('posOrders')

const isExpanded = ref(false)
const orderItemsQuery = computed(() => isExpanded.value ? { orderId: props.item.id } : {})
const { items: orderItems, pending: itemsPending } = await useCollectionQuery('posOrderitems', {
  query: orderItemsQuery,
  watch: true,
})

const statusConfig = {
  pending: { color: 'warning' as const, label: 'Pending', icon: 'i-lucide-clock' },
  printing: { color: 'info' as const, label: 'Printing', icon: 'i-lucide-printer' },
  completed: { color: 'success' as const, label: 'Completed', icon: 'i-lucide-check' },
  failed: { color: 'error' as const, label: 'Failed', icon: 'i-lucide-x' },
}

const currentStatus = computed(() => statusConfig[props.item.status as keyof typeof statusConfig] || statusConfig.pending)

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Printing', value: 'printing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

const updatingStatus = ref(false)
async function changeStatus(newStatus: string) {
  updatingStatus.value = true
  try {
    await update(props.item.id, { status: newStatus })
  } finally {
    updatingStatus.value = false
  }
}

const reprinting = ref(false)
async function reprint() {
  reprinting.value = true
  try {
    // Call reprint API - adjust endpoint as needed
    await $fetch(`/api/pos/events/${props.item.eventId}/orders/${props.item.id}/reprint`, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Reprint failed:', error)
  } finally {
    reprinting.value = false
  }
}

function handleDelete() {
  open('delete', props.collection, [props.item.id])
}

const clientDisplay = computed(() => {
  if (props.item.clientIdData?.title) return props.item.clientIdData.title
  if (props.item.clientName) return props.item.clientName
  return 'Walk-in'
})

const helperName = computed(() => props.item.ownerUser?.name || 'Unknown')

const formattedTime = computed(() => {
  const date = new Date(props.item.createdAt)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
})

const formattedDate = computed(() => {
  const date = new Date(props.item.createdAt)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

const orderTotal = computed(() => {
  if (!orderItems.value?.length) return null
  const total = (orderItems.value as PosOrderItem[]).reduce((sum, item) => sum + item.totalPrice, 0)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(total)
})

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <UCard variant="soft">
    <div class="space-y-3">
      <!-- Header Row -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3">
          <UButton
            :icon="isExpanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="isExpanded = !isExpanded"
          />
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-lg">#{{ item.eventOrderNumber || item.id.slice(-4) }}</span>
              <UBadge :color="currentStatus.color" variant="subtle" size="xs">
                <UIcon :name="currentStatus.icon" class="w-3 h-3 mr-1" />
                {{ currentStatus.label }}
              </UBadge>
              <UBadge v-if="item.isPersonnel" color="neutral" variant="outline" size="xs">
                Staff
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              {{ clientDisplay }}
            </p>
          </div>
        </div>

        <div class="text-right text-sm text-muted">
          <div>{{ formattedTime }}</div>
          <div>{{ formattedDate }}</div>
        </div>
      </div>

      <!-- Meta Row -->
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-2 text-muted">
          <UIcon name="i-lucide-user" class="w-4 h-4" />
          <span>{{ helperName }}</span>
        </div>
        <div v-if="orderTotal" class="font-semibold">
          {{ orderTotal }}
        </div>
      </div>

      <!-- Expandable Order Items -->
      <UCollapsible v-model:open="isExpanded" :unmount-on-hide="false">
        <template #content>
          <div class="pt-3 border-t border-default space-y-2">
            <div v-if="itemsPending" class="flex items-center justify-center py-4">
              <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin text-muted" />
            </div>
            <div v-else-if="orderItems?.length" class="space-y-1">
              <div
                v-for="orderItem in (orderItems as PosOrderItem[])"
                :key="orderItem.id"
                class="flex items-center justify-between text-sm py-1"
              >
                <div class="flex items-center gap-2">
                  <span class="text-muted">{{ orderItem.quantity }}x</span>
                  <span>{{ (orderItem as any).productIdData?.title || 'Product' }}</span>
                </div>
                <span class="font-medium">{{ formatPrice(orderItem.totalPrice) }}</span>
              </div>
              <div v-if="item.overallRemarks" class="text-sm text-muted italic pt-2">
                Note: {{ item.overallRemarks }}
              </div>
            </div>
            <div v-else class="text-sm text-muted text-center py-2">
              No items
            </div>
          </div>
        </template>
      </UCollapsible>

      <!-- Actions Row -->
      <div class="flex items-center justify-between pt-2 border-t border-default">
        <div class="flex items-center gap-2">
          <USelectMenu
            :model-value="item.status"
            :items="statusOptions"
            value-key="value"
            size="xs"
            :loading="updatingStatus"
            class="w-28"
            @update:model-value="changeStatus"
          />
          <UButton
            icon="i-lucide-printer"
            variant="ghost"
            color="neutral"
            size="xs"
            :loading="reprinting"
            @click="reprint"
          >
            Reprint
          </UButton>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          variant="ghost"
          color="error"
          size="xs"
          @click="handleDelete"
        />
      </div>
    </div>
  </UCard>
</template>
