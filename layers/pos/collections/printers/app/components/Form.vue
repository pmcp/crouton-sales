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
        <UFormField v-if="!props.activeItem?.eventId" label="EventId" name="eventId" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.eventId"
            collection="posEvents"
            label="EventId"
          />
        </UFormField>
        <UFormField label="LocationId" name="locationId" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.locationId"
            collection="posLocations"
            label="LocationId"
          />
        </UFormField>
        <UFormField label="Title" name="title" class="not-last:pb-4">
          <UInput v-model="state.title" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="IpAddress" name="ipAddress" class="not-last:pb-4">
          <UInput v-model="state.ipAddress" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Port" name="port" class="not-last:pb-4">
          <UInput v-model="state.port" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Status" name="status" class="not-last:pb-4">
          <UInput v-model="state.status" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="ShowPrices" name="showPrices" class="not-last:pb-4">
          <UCheckbox v-model="state.showPrices" />
        </UFormField>
        <UFormField label="IsActive" name="isActive" class="not-last:pb-4">
          <UCheckbox v-model="state.isActive" />
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
import type { PosPrinterFormProps, PosPrinterFormData } from '../../types'
import usePosPrinters from '../composables/usePosPrinters'

const props = defineProps<PosPrinterFormProps>()
const { defaultValue, schema, collection } = usePosPrinters()

// Form layout configuration
const tabs = ref(false)



// Use new mutation composable for data operations
const { create, update, deleteItems } = useCollectionMutation(collection)

// useCrouton still manages modal state
const { close } = useCrouton()

// Initialize form state with proper values (no watch needed!)
// For both create and update, merge activeItem to support pre-filled defaults (e.g., eventId)
const initialValues = props.action === 'update' && props.activeItem?.id
  ? { ...defaultValue, ...props.activeItem }
  : { ...defaultValue, ...props.activeItem }

const state = ref<PosPrinterFormData & { id?: string | null }>(initialValues)

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