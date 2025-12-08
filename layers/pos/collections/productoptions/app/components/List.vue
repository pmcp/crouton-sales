<template>
  <CroutonCollection
    :layout="layout"
    collection="posProductOptions"
    :columns="columns"
    :rows="productoptions || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosProductOptions"
        :collection="'posProductOptions'"
        createButton
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
import { usePosProductOptions } from '../composables/usePosProductOptions'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosProductOptions()

const { items: productoptions, pending } = await useCollectionQuery(
  'posProductOptions'
)
</script>