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
        <UFormField label="ProductId" name="productId" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.productId"
            collection="posProducts"
            label="ProductId"
          />
        </UFormField>
        <UFormField label="OptionName" name="optionName" class="not-last:pb-4">
          <UInput v-model="state.optionName" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="AdditionalPrice" name="additionalPrice" class="not-last:pb-4">
          <UInputNumber v-model="state.additionalPrice" class="w-full" />
        </UFormField>
        <UFormField label="DisplayOrder" name="displayOrder" class="not-last:pb-4">
          <UInput v-model="state.displayOrder" class="w-full" size="xl" />
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
import type { PosProductOptionFormProps, PosProductOptionFormData } from '../../types'
import { usePosProductOptions } from '../composables/usePosProductOptions'

const props = defineProps<PosProductOptionFormProps>()
const { defaultValue, schema, collection } = usePosProductOptions()

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

const state = ref<PosProductOptionFormData & { id?: string | null }>(initialValues)

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