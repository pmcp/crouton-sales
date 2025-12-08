<template>
  <CroutonCollection
    :layout="layout"
    collection="posProducts"
    :columns="columns"
    :rows="products || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosProducts"
        :collection="'posProducts'"
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
    <template #categoryId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.categoryId"
        :id="row.original.categoryId"
        collection="posCategories"
      />
    </template>
    <template #locationId-cell="{ row }">
      <CroutonItemCardMini
        v-if="row.original.locationId"
        :id="row.original.locationId"
        collection="posLocations"
      />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import usePosProducts from '../composables/usePosProducts'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosProducts()

const { items: products, pending } = await useCollectionQuery(
  'posProducts'
)
</script>