<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="w-full max-w-sm space-y-6">
      <!-- Loading state -->
      <div v-if="loading" class="text-center">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
        <p class="mt-2 text-gray-500">Loading event...</p>
      </div>

      <!-- Event not found -->
      <div v-else-if="!event" class="text-center">
        <UIcon name="i-lucide-alert-circle" class="text-4xl text-red-500 mb-2" />
        <p class="text-gray-700 dark:text-gray-300 font-medium">Event not found</p>
        <p class="text-gray-500 text-sm mt-1">Please check the URL and try again.</p>
      </div>

      <!-- Login form -->
      <template v-else>
        <div class="text-center">
          <UIcon name="i-lucide-store" class="text-4xl text-primary-500 mb-2" />
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ event.title }}</h1>
          <p class="text-gray-500 mt-1">Helper Login</p>
        </div>

        <UCard>
          <UForm :state="formState" @submit="onSubmit" class="space-y-4">
            <UFormField label="Helper" name="helper">
              <USelectMenu
                v-model="selectedHelperId"
                :items="helperOptions"
                value-key="id"
                label-key="label"
                placeholder="Select or create helper"
                size="lg"
                class="w-full"
                :search-input="false"
              />
            </UFormField>

            <UFormField v-if="isCreatingNew" label="Your Name" name="helperName">
              <UInput
                v-model="formState.helperName"
                placeholder="Enter your name"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField label="PIN" name="pin">
              <UInput
                v-model="formState.pin"
                type="password"
                placeholder="Enter PIN"
                size="lg"
                class="w-full"
                :ui="{ base: 'font-mono text-center tracking-widest' }"
                inputmode="numeric"
                pattern="[0-9]*"
              />
            </UFormField>

            <UButton
              type="submit"
              :loading="submitting"
              block
              size="lg"
              icon="i-lucide-log-in"
            >
              Login
            </UButton>
          </UForm>
        </UCard>

        <p v-if="errorMessage" class="text-center text-red-500 text-sm">
          {{ errorMessage }}
        </p>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

interface PosEvent {
  id: string
  teamId: string
  title: string
  slug: string
  helperPin?: string
}

interface Helper {
  id: string
  title: string
}

interface HelperOption {
  id: string
  label: string
  icon?: string
}

const CREATE_NEW_ID = '__create_new__'

const route = useRoute()
const teamSlug = computed(() => route.params.team as string)
const eventSlug = computed(() => route.params.event as string)

const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const event = ref<PosEvent | null>(null)
const teamId = ref<string | null>(null)
const helpers = ref<Helper[]>([])
const selectedHelperId = ref<string | null>(null)

const formState = reactive({
  helperName: '',
  pin: '',
})

const isCreatingNew = computed(() => selectedHelperId.value === CREATE_NEW_ID)

const helperOptions = computed<HelperOption[]>(() => {
  const options: HelperOption[] = helpers.value.map(h => ({
    id: h.id,
    label: h.title,
    icon: 'i-lucide-user',
  }))

  // Add "Create new helper" option at the end
  options.push({
    id: CREATE_NEW_ID,
    label: 'Create new helper',
    icon: 'i-lucide-user-plus',
  })

  return options
})

// Fetch team and event data
onMounted(async () => {
  try {
    // First, get the team by slug to get the teamId
    const teamResponse = await $fetch<{ id: string; slug: string }>(`/api/teams/by-slug/${teamSlug.value}`)
    if (!teamResponse) {
      loading.value = false
      return
    }
    teamId.value = teamResponse.id

    // Then fetch the event by slug using the public endpoint
    event.value = await $fetch<PosEvent>(`/api/pos/events/${teamId.value}/by-slug/${eventSlug.value}`)

    // Fetch existing helpers for this event
    if (event.value) {
      try {
        helpers.value = await $fetch<Helper[]>(`/api/pos/helpers/${event.value.id}`)
      }
      catch (err) {
        console.error('Failed to load helpers:', err)
        // Non-critical error, continue without helpers
      }
    }
  }
  catch (err) {
    console.error('Failed to load event:', err)
  }
  finally {
    loading.value = false
  }
})

async function onSubmit() {
  if (!event.value || !teamId.value) return

  // Validate selection
  if (!selectedHelperId.value) {
    errorMessage.value = 'Please select a helper or create a new one.'
    return
  }

  // Validate name when creating new
  if (isCreatingNew.value && !formState.helperName.trim()) {
    errorMessage.value = 'Please enter your name.'
    return
  }

  errorMessage.value = ''
  submitting.value = true

  try {
    const body: Record<string, string> = {
      pin: formState.pin,
    }

    if (isCreatingNew.value) {
      body.helperName = formState.helperName.trim()
    }
    else {
      body.helperId = selectedHelperId.value
    }

    const response = await $fetch(`/api/teams/${teamId.value}/pos-events/${event.value.id}/helper-login`, {
      method: 'POST',
      body,
    })

    // Store the token in a cookie
    const helperToken = useCookie('pos-helper-token', {
      maxAge: 60 * 60 * 8, // 8 hours
    })
    helperToken.value = response.token

    // Store helper info in localStorage for quick access
    if (import.meta.client) {
      localStorage.setItem('pos-helper-info', JSON.stringify({
        token: response.token,
        helperName: response.helperName,
        eventId: response.eventId,
        teamId: teamId.value,
        expiresAt: response.expiresAt,
      }))
    }

    // Redirect to the order interface
    await navigateTo(`/order/${teamSlug.value}/${eventSlug.value}`)
  }
  catch (err: any) {
    errorMessage.value = err.data?.message || err.statusMessage || 'Login failed. Please check your PIN.'
  }
  finally {
    submitting.value = false
  }
}
</script>
