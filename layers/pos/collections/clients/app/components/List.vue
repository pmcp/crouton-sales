<template>
  <CroutonCollection
    :layout="layout"
    collection="posClients"
    :columns="columns"
    :rows="clients || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosClients"
        :collection="'posClients'"
        createButton
      />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import usePosClients from '../composables/usePosClients'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosClients()

const { items: clients, pending } = await useCollectionQuery(
  'posClients'
)
</script>