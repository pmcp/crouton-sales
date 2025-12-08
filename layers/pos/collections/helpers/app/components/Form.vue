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
        <UFormField label="EventId" name="eventId" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.eventId"
            collection="posEvents"
            label="EventId"
          />
        </UFormField>
        <UFormField label="Title" name="title" class="not-last:pb-4">
          <UInput v-model="state.title" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Token" name="token" class="not-last:pb-4">
          <UInput v-model="state.token" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="IsActive" name="isActive" class="not-last:pb-4">
          <UCheckbox v-model="state.isActive" />
        </UFormField>
        <UFormField label="ExpiresAt" name="expiresAt" class="not-last:pb-4">
          <CroutonCalendar v-model:date="state.expiresAt" />
        </UFormField>
        <UFormField label="LastActiveAt" name="lastActiveAt" class="not-last:pb-4">
          <CroutonCalendar v-model:date="state.lastActiveAt" />
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
import type { PosHelperFormProps, PosHelperFormData } from '../../types'
import usePosHelpers from '../composables/usePosHelpers'

const props = defineProps<PosHelperFormProps>()
const { defaultValue, schema, collection } = usePosHelpers()

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

// Convert date strings to Date objects for date fields during editing
if (props.action === 'update' && props.activeItem?.id) {
  if (initialValues.expiresAt) {
    initialValues.expiresAt = new Date(initialValues.expiresAt)
  }
  if (initialValues.lastActiveAt) {
    initialValues.lastActiveAt = new Date(initialValues.lastActiveAt)
  }
}

const state = ref<PosHelperFormData & { id?: string | null }>(initialValues)

const handleSubmit = async () => {
  try {
    // Serialize Date objects to ISO strings for API submission
    const serializedData = { ...state.value }
    if (serializedData.expiresAt instanceof Date) {
      serializedData.expiresAt = serializedData.expiresAt.toISOString()
    }
    if (serializedData.lastActiveAt instanceof Date) {
      serializedData.lastActiveAt = serializedData.lastActiveAt.toISOString()
    }

    if (props.action === 'create') {
      await create(serializedData)
    } else if (props.action === 'update' && state.value.id) {
      await update(state.value.id, serializedData)
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