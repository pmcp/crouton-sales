<template>
  <CroutonCollection
    :layout="layout"
    collection="posEvents"
    :columns="columnsWithActions"
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
    <template #actions-cell="{ row }">
      <UButton
        icon="i-lucide-copy"
        size="xs"
        color="neutral"
        variant="ghost"
        :loading="duplicatingId === row.original.id"
        @click="duplicateEvent(row.original.id)"
      />
    </template>
  </CroutonCollection>
</template>

<script setup lang="ts">
import usePosEvents from '../composables/usePosEvents'

const props = withDefaults(defineProps<{
  layout?: any
}>(), {
  layout: 'table'
})

const { columns } = usePosEvents()
const toast = useToast()
const { currentTeam } = useTeam()

const columnsWithActions = computed(() => [
  ...columns,
  { accessorKey: 'actions', header: '' }
])

const { items: events, pending, refresh } = await useCollectionQuery(
  'posEvents'
)

const duplicatingId = ref<string | null>(null)

async function duplicateEvent(eventId: string) {
  duplicatingId.value = eventId
  try {
    await $fetch(`/api/teams/${currentTeam.value.id}/pos-events/${eventId}/duplicate`, {
      method: 'POST'
    })
    toast.add({
      title: 'Event duplicated',
      description: 'Event and all related data have been copied',
      color: 'success'
    })
    await refresh()
  } catch (error) {
    toast.add({
      title: 'Duplication failed',
      description: 'Could not duplicate the event',
      color: 'error'
    })
  } finally {
    duplicatingId.value = null
  }
}
</script>