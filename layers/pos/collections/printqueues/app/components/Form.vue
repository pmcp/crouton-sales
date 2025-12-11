<template>
  <CroutonFormActionButton
    v-if="action === 'delete'"
    :action="action"
    :collection="collection"
    :items="items"
    :loading="loading"
    @click="handleSubmit"
  />

  <UForm
    v-else
    :schema="schema"
    :state="state"
    @submit="handleSubmit"
  >
    <CroutonFormLayout>
      <template #main>
      <div class="flex flex-col gap-4 p-1">
        <UFormField label="TeamId" name="teamId" class="not-last:pb-4">
          <UInput v-model="state.teamId" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Owner" name="owner" class="not-last:pb-4">
          <UInput v-model="state.owner" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="EventId" name="eventId" class="not-last:pb-4">
          <UInput v-model="state.eventId" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="OrderId" name="orderId" class="not-last:pb-4">
          <UInput v-model="state.orderId" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="PrinterId" name="printerId" class="not-last:pb-4">
          <UInput v-model="state.printerId" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="LocationId" name="locationId" class="not-last:pb-4">
          <UInput v-model="state.locationId" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Status" name="status" class="not-last:pb-4">
          <UInput v-model="state.status" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="PrintData" name="printData" class="not-last:pb-4">
          <UTextarea v-model="state.printData" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="PrintMode" name="printMode" class="not-last:pb-4">
          <UInput v-model="state.printMode" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="ErrorMessage" name="errorMessage" class="not-last:pb-4">
          <UTextarea v-model="state.errorMessage" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="RetryCount" name="retryCount" class="not-last:pb-4">
          <UInput v-model="state.retryCount" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="CompletedAt" name="completedAt" class="not-last:pb-4">
          <UInput v-model="state.completedAt" class="w-full" size="xl" />
        </UFormField>
      </div>
      </template>

      <template #footer>
        <CroutonFormActionButton
          :action="action"
          :collection="collection"
          :items="items"
          :loading="loading"
        />
      </template>
    </CroutonFormLayout>
  </UForm>
</template>

<script setup lang="ts">
import type { PosPrintqueueFormProps, PosPrintqueueFormData } from '../../types'
import usePosPrintqueues from '../composables/usePosPrintqueues'

const props = defineProps<PosPrintqueueFormProps>()
const { defaultValue, schema, collection } = usePosPrintqueues()

// Form layout configuration
const tabs = ref(false)



// Use new mutation composable for data operations
const { create, update, deleteItems } = useCollectionMutation(collection)

// useCrouton still manages modal state
const { close } = useCrouton()

// Initialize form state with proper values (no watch needed!)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue }

const state = ref<PosPrintqueueFormData & { id?: string | null }>(initialValues)

const handleSubmit = async () => {
  try {
    if (props.action === 'create') {
      await create(state.value)
    } else if (props.action === 'update' && state.value.id) {
      await update(state.value.id, state.value)
    } else if (props.action === 'delete') {
      await deleteItems(props.items)
    }

    close()

  } catch (error) {
    console.error('Form submission failed:', error)
    // You can add toast notification here if available
    // toast.add({ title: 'Error', description: 'Failed to submit form', color: 'red' })
  }
}
</script>