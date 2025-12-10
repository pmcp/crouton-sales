<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary-500" />
    </div>

    <!-- Not authenticated -->
    <div v-else-if="!isAuthenticated" class="flex items-center justify-center h-screen">
      <div class="text-center space-y-4">
        <UIcon name="i-lucide-lock" class="text-4xl text-gray-400" />
        <p class="text-gray-700 dark:text-gray-300">Please login to access the order interface</p>
        <UButton
          :to="`/pos/${teamSlug}/${eventSlug}/helper`"
          icon="i-lucide-log-in"
        >
          Login
        </UButton>
      </div>
    </div>

    <!-- Event not found -->
    <div v-else-if="!event" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <UIcon name="i-lucide-alert-circle" class="text-4xl text-red-500 mb-2" />
        <p class="text-gray-700 dark:text-gray-300 font-medium">Event not found</p>
      </div>
    </div>

    <!-- Order interface -->
    <div v-else class="h-screen flex flex-col">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 border-b px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-store" class="text-xl text-primary-500" />
          <div>
            <h1 class="font-semibold text-gray-900 dark:text-white">{{ event.title }}</h1>
            <p class="text-sm text-gray-500">{{ helperName }}</p>
          </div>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-log-out"
          @click="handleLogout"
        >
          Logout
        </UButton>
      </div>

      <!-- Order interface component -->
      <div class="flex-1 overflow-hidden">
        <HelperOrderInterface :event-id="event.id" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
interface PosEvent {
  id: string
  teamId: string
  title: string
  slug: string
}

const route = useRoute()
const teamSlug = computed(() => route.params.team as string)
const eventSlug = computed(() => route.params.eventSlug as string)

const { isHelper, helperName, loadSession, logout, eventId: sessionEventId, teamId: sessionTeamId } = useHelperAuth()

const loading = ref(true)
const event = ref<PosEvent | null>(null)
const isAuthenticated = ref(false)

onMounted(async () => {
  // Check helper authentication
  loadSession()

  if (!isHelper.value) {
    loading.value = false
    return
  }

  try {
    // Fetch the team ID from slug
    const teamResponse = await $fetch<{ id: string }>(`/api/teams/by-slug/${teamSlug.value}`)

    // Verify the session matches this team
    if (sessionTeamId.value !== teamResponse.id) {
      loading.value = false
      return
    }

    // Fetch the event by slug using the public endpoint
    const foundEvent = await $fetch<PosEvent>(`/api/pos/events/${teamResponse.id}/by-slug/${eventSlug.value}`)

    if (!foundEvent) {
      loading.value = false
      return
    }

    // Verify the session matches this event
    if (sessionEventId.value !== foundEvent.id) {
      loading.value = false
      return
    }

    event.value = foundEvent
    isAuthenticated.value = true
  }
  catch (err) {
    console.error('Failed to load event:', err)
  }
  finally {
    loading.value = false
  }
})

async function handleLogout() {
  await logout()
  await navigateTo(`/pos/${teamSlug.value}/${eventSlug.value}/helper`)
}
</script>
