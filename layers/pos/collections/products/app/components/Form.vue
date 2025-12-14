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
        <UFormField label="CategoryId" name="categoryId" class="not-last:pb-4">
          <CroutonFormReferenceSelect
            v-model="state.categoryId"
            collection="posCategories"
            label="CategoryId"
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
        <UFormField label="Description" name="description" class="not-last:pb-4">
          <UTextarea v-model="state.description" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="Price" name="price" class="not-last:pb-4">
          <UInputNumber v-model="state.price" class="w-full" />
        </UFormField>
        <UFormField label="IsActive" name="isActive" class="not-last:pb-4">
          <UCheckbox v-model="state.isActive" />
        </UFormField>
        <UFormField label="RequiresRemark" name="requiresRemark" class="not-last:pb-4">
          <UCheckbox v-model="state.requiresRemark" />
        </UFormField>
        <UFormField label="RemarkPrompt" name="remarkPrompt" class="not-last:pb-4">
          <UInput v-model="state.remarkPrompt" class="w-full" size="xl" />
        </UFormField>
        <UFormField label="HasOptions" name="hasOptions" class="not-last:pb-4">
          <UCheckbox v-model="state.hasOptions" />
        </UFormField>
        <template v-if="state.hasOptions">
          <UFormField label="MultipleOptionsAllowed" name="multipleOptionsAllowed" class="not-last:pb-4">
            <UCheckbox v-model="state.multipleOptionsAllowed" />
          </UFormField>
          <UFormField label="Options" name="options" class="not-last:pb-4">
            <div class="space-y-2">
              <div v-for="(option, index) in productOptions" :key="option.id" class="flex gap-2 items-center">
                <UInput v-model="option.label" placeholder="Option name" class="flex-1" />
                <UInputNumber v-model="option.priceModifier" :step="0.01" placeholder="+€" class="w-28" />
                <UButton icon="i-lucide-trash" color="error" variant="ghost" @click="removeOption(index)" />
              </div>
              <UButton icon="i-lucide-plus" label="Add Option" variant="soft" size="sm" @click="addOption" />
            </div>
          </UFormField>
        </template>
        <UFormField label="SortOrder" name="sortOrder" class="not-last:pb-4">
          <UInput v-model="state.sortOrder" class="w-full" size="xl" />
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
import { nanoid } from 'nanoid'
import type { PosProductFormProps, PosProductFormData } from '../../types'
import usePosProducts from '../composables/usePosProducts'

interface ProductOption {
  id: string
  label: string
  priceModifier: number
}

const props = defineProps<PosProductFormProps>()
const { defaultValue, schema, collection } = usePosProducts()

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

const state = ref<PosProductFormData & { id?: string | null }>(initialValues)

// Debug: log initial values
console.log('[ProductForm] action:', props.action)
console.log('[ProductForm] activeItem:', props.activeItem)
console.log('[ProductForm] initialValues:', initialValues)
console.log('[ProductForm] state.eventId:', state.value.eventId)

// Product options management
const productOptions = computed({
  get: () => (state.value.options as ProductOption[]) || [],
  set: (value: ProductOption[]) => { state.value.options = value }
})

function addOption() {
  if (!state.value.options || !Array.isArray(state.value.options)) {
    state.value.options = []
  }
  (state.value.options as ProductOption[]).push({
    id: nanoid(),
    label: '',
    priceModifier: 0
  })
}

function removeOption(index: number) {
  if (Array.isArray(state.value.options)) {
    state.value.options.splice(index, 1)
  }
}

const handleSubmit = async () => {
  console.log('[ProductForm] handleSubmit called')
  console.log('[ProductForm] state.value:', state.value)
  try {
    if (props.action === 'create') {
      console.log('[ProductForm] Creating product...')
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
