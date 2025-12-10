<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-muted">Client</label>

    <!-- Reusable clients mode: dropdown with search -->
    <template v-if="useReusableClients">
      <USelectMenu
        v-model="selectedClientId"
        :items="clientItems"
        value-key="value"
        placeholder="Select or create client..."
        icon="i-lucide-user"
        size="lg"
        class="w-full"
        create-item
        @create="onCreateClient"
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
  'create-client': [name: string]
}>()

// For reusable clients mode
const selectedClientId = ref<string | null>(null)

// For free-text mode
const clientName = ref('')

// Convert clients to SelectMenu items format
const clientItems = computed(() =>
  props.clients.map(client => ({
    label: client.title,
    value: client.id,
  }))
)

// Handle creating a new client
function onCreateClient(name: string) {
  emit('create-client', name)
}

// Emit changes
watch(selectedClientId, (value) => {
  emit('update:clientId', value)
  // Also emit the client name for display purposes
  const client = props.clients.find(c => c.id === value)
  emit('update:clientName', client?.title || '')
})

watch(clientName, (value) => {
  emit('update:clientName', value)
  emit('update:clientId', null)
})
</script>
