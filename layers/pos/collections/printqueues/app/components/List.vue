<template>
  <CroutonCollection
    :layout="layout"
    collection="posPrintqueues"
    :columns="columns"
    :rows="printqueues || []"
    :loading="pending"
  >
    <template #header>
      <CroutonTableHeader
        title="PosPrintqueues"
        :collection="'posPrintqueues'"
        createButton
      />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import usePosPrintqueues from '../composables/usePosPrintqueues'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosPrintqueues()

const { items: printqueues, pending } = await useCollectionQuery(
  'posPrintqueues'
)
</script>