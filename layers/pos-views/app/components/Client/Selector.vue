<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-muted">Client</label>

    <!-- Reusable clients mode: dropdown with search and create -->
    <template v-if="useReusableClients">
      <USelectMenu
        v-model="selectedValue"
        :items="allItems"
        placeholder="Select or create client..."
        icon="i-lucide-user"
        size="lg"
        class="w-full"
        :loading="creating"
        create-item
        @create="onCreate"
      />
    </template>

    <!-- Free-text mode: simple input -->
    <template v-else>
      <UInput
        v-model="clientName"
        placeholder="Enter client name..."
        icon="i-lucide-user"
        size="lg"
        class="w-full"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
interface Client {
  id: string
  title: string
}

const props = defineProps<{
  clients: Client[]
  useReusableClients: boolean
}>()

const emit = defineEmits<{
  'update:clientId': [clientId: string | null]
  'update:clientName': [clientName: string]
  'client-created': [client: Client]
}>()

// For free-text mode
const clientName = ref('')

// For reusable clients mode
const selectedValue = ref<string>('')
const creating = ref(false)

// Track newly created clients (with their IDs)
const createdClients = ref<Client[]>([])

// Combine existing clients with any newly created items
const allItems = computed(() => {
  const existing = props.clients.map(c => c.title)
  const created = createdClients.value.map(c => c.title)
  return [...existing, ...created]
})

// All clients including created ones (for ID lookup)
const allClients = computed(() => [...props.clients, ...createdClients.value])

// Use crouton mutation to create client in database
const { create } = useCollectionMutation('posClients')

// Handle creating a new client
async function onCreate(title: string) {
  creating.value = true
  try {
    const newClient = await create({ title, isReusable: true })
    if (newClient?.id) {
      createdClients.value.push({ id: newClient.id, title })
      selectedValue.value = title
      emit('client-created', { id: newClient.id, title })
    }
  } catch (error) {
    console.error('Failed to create client:', error)
  } finally {
    creating.value = false
  }
}

// Emit changes for reusable mode
watch(selectedValue, (value) => {
  if (!value) return

  // Find the client (from existing or created)
  const client = allClients.value.find(c => c.title === value)
  if (client) {
    emit('update:clientId', client.id)
    emit('update:clientName', client.title)
  }
})

// Emit changes for free-text mode
watch(clientName, (value) => {
  emit('update:clientName', value)
  emit('update:clientId', null)
})
</script>
