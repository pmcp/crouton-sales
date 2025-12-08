<template>
  <CroutonCollection
    :layout="layout"
    collection="posLocations"
    :columns="columns"
    :rows="locations || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosLocations"
        :collection="'posLocations'"
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
  </CroutonCollection>
</template>

<script setup lang="ts">
import usePosLocations from '../composables/usePosLocations'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosLocations()

const { items: locations, pending } = await useCollectionQuery(
  'posLocations'
)
</script>