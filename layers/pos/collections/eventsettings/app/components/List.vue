<template>
  <CroutonCollection
    :layout="layout"
    collection="posEventSettings"
    :columns="columns"
    :rows="eventsettings || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosEventSettings"
        :collection="'posEventSettings'"
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
import usePosEventSettings from '../composables/usePosEventSettings'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosEventSettings()

const { items: eventsettings, pending } = await useCollectionQuery(
  'posEventSettings'
)
</script>