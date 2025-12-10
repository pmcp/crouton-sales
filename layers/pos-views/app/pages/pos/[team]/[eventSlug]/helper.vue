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
            <UFormField label="Your Name" name="helperName">
              <UInput
                v-model="formState.helperName"
                placeholder="Enter your name"
                size="lg"
                autofocus
              />
            </UFormField>

            <UFormField label="PIN" name="pin">
              <UInput
                v-model="formState.pin"
                type="password"
                placeholder="Enter PIN"
                size="lg"
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
interface PosEvent {
  id: string
  teamId: string
  title: string
  slug: string
  helperPin?: string
}

const route = useRoute()
const teamSlug = computed(() => route.params.team as string)
const eventSlug = computed(() => route.params.eventSlug as string)

const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const event = ref<PosEvent | null>(null)
const teamId = ref<string | null>(null)

const formState = reactive({
  helperName: '',
  pin: '',
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

  errorMessage.value = ''
  submitting.value = true

  try {
    const response = await $fetch(`/api/teams/${teamId.value}/pos-events/${event.value.id}/helper-login`, {
      method: 'POST',
      body: {
        pin: formState.pin,
        helperName: formState.helperName || 'Helper',
      },
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
    await navigateTo(`/pos/${teamSlug.value}/${eventSlug.value}/orders`)
  }
  catch (err: any) {
    errorMessage.value = err.data?.message || err.statusMessage || 'Login failed. Please check your PIN.'
  }
  finally {
    submitting.value = false
  }
}
</script>
