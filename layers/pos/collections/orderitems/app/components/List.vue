<template>
  <CroutonCollection
    :layout="layout"
    collection="posOrderItems"
    :columns="columns"
    :rows="orderitems || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosOrderItems"
        :collection="'posOrderItems'"
        createButton
      />
    </template>
    <template #orderId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.orderId"
        :id="row.original.orderId"
        collection="posOrders"
      />
    </template>
    <template #productId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.productId"
        :id="row.original.productId"
        collection="posProducts"
      />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import usePosOrderItems from '../composables/usePosOrderItems'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosOrderItems()

const { items: orderitems, pending } = await useCollectionQuery(
  'posOrderItems'
)
</script>