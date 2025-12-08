<template>
  <CroutonCollection
    :layout="layout"
    collection="posPrinters"
    :columns="columns"
    :rows="printers || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosPrinters"
        :collection="'posPrinters'"
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
import usePosPrinters from '../composables/usePosPrinters'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosPrinters()

const { items: printers, pending } = await useCollectionQuery(
  'posPrinters'
)
</script>