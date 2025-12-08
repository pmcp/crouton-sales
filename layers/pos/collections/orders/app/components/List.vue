<template>
  <CroutonCollection
    :layout="layout"
    collection="posOrders"
    :columns="columns"
    :rows="orders || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosOrders"
        :collection="'posOrders'"
        createButton
      />
    </template>
    <template #eventId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.eventId"
        :id="row.original.eventId"
        collection="posEvents"
      />
    </template>
    <template #clientId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.clientId"
        :id="row.original.clientId"
        collection="posClients"
      />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import usePosOrders from '../composables/usePosOrders'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosOrders()

const { items: orders, pending } = await useCollectionQuery(
  'posOrders'
)
</script>