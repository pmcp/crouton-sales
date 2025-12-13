<template>
  <CroutonCollection
    :layout="layout"
    collection="posHelpers"
    :columns="columns"
    :rows="helpers || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosHelpers"
        :collection="'posHelpers'"
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
    <template #expiresAt-cell="{ row }">
      <CroutonDate :date="row.original.expiresAt"></CroutonDate>
    </template>
    <template #lastActiveAt-cell="{ row }">
      <CroutonDate :date="row.original.lastActiveAt"></CroutonDate>
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import usePosHelpers from '../composables/usePosHelpers'

const props = withDefaults(defineProps<{
  layout?: any
  query?: Record<string, any>
}>(), {
  layout: 'table'
})

const { columns } = usePosHelpers()

const { items: helpers, pending } = await useCollectionQuery(
  'posHelpers',
  { query: computed(() => props.query || {}) }
)
</script>