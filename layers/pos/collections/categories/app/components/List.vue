<template>
  <CroutonCollection
    :layout="layout"
    collection="posCategories"
    :columns="columns"
    :rows="categories || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosCategories"
        :collection="'posCategories'"
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
import usePosCategories from '../composables/usePosCategories'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosCategories()

const { items: categories, pending } = await useCollectionQuery(
  'posCategories'
)
</script>