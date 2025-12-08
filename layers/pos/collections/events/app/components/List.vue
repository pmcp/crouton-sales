<template>
  <CroutonCollection
    :layout="layout"
    collection="posEvents"
    :columns="columns"
    :rows="events || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosEvents"
        :collection="'posEvents'"
        createButton
      />
    </template>
    <template #startDate-cell="{ row }">
      <CroutonDate :date="row.original.startDate"></CroutonDate>
    </template>
    <template #endDate-cell="{ row }">
      <CroutonDate :date="row.original.endDate"></CroutonDate>
    </template>
    <template #archivedAt-cell="{ row }">
      <CroutonDate :date="row.original.archivedAt"></CroutonDate>
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import { usePosEvents } from '../composables/usePosEvents'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosEvents()

const { items: events, pending } = await useCollectionQuery(
  'posEvents'
)
</script>