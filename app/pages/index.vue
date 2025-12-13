<!-- Everything in a single page on purpose. So you can just delete it if you don't need it. -->
<template>
  <main class="px-4">
    <header>
      <div class="flex w-full items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <img src="/logo.png" alt="logo" class="h-6 w-auto md:h-7">
          <p class="font-bold">Supersaas V3</p>
        </NuxtLink>
        <div class="hidden flex-1 items-center justify-center gap-3 md:flex">
          <UButton label="Features" color="neutral" variant="ghost" />
          <UButton label="Pricing" color="neutral" variant="ghost" />
          <UButton label="Blog" color="neutral" variant="ghost" />
          <UButton label="Docs" color="neutral" variant="ghost" />
        </div>
        <div class="flex items-center gap-3">
          <AuthState v-slot="{ loggedIn: isAuthLoggedIn }">
            <UButton
              v-if="isAuthLoggedIn"
              color="neutral"
              variant="soft"
              label="Go to App"
              to="/dashboard"
            />
            <div v-else class="inline-flex items-center rounded-md">
              <UButton
                color="neutral"
                variant="soft"
                to="/auth/login"
                label="Login"
                class="rounded-r-none"
              />
              <UDropdownMenu
                :items="authOptions"
                :content="{
                  align: 'end',
                  side: 'bottom',
                  sideOffset: 8,
                }"
                :ui="{
                  content: 'w-full',
                  itemLeadingIcon: 'size-4',
                }"
              >
                <UButton
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-chevron-down"
                  class="rounded-l-none border-l border-neutral-200/50 dark:border-white/10"
                />
              </UDropdownMenu>
            </div>
          </AuthState>
          <ThemeToggle />
        </div>
      </div>
    </header>
  </main>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { loggedIn } = useUserSession()
const authOptions = ref([
  {
    label: 'Login (Email/Password)',
    to: '/auth/login',
    icon: 'i-lucide-key-square',
  },
  {
    label: 'Login with Magic Link',
    to: '/auth/magic-link',
    icon: 'i-lucide-mail',
  },
  {
    label: 'Login with Passkey',
    to: '/auth/login-passkey',
    icon: 'i-lucide-fingerprint',
  },
  {
    label: 'Social Login',
    to: '/auth/social-login',
    icon: 'i-lucide-twitter',
  },
  {
    label: 'Phone Number Login',
    to: '/auth/login-phone',
    icon: 'i-lucide-phone',
  },
  {
    label: 'Register',
    to: '/auth/register',
    icon: 'i-lucide-user-plus',
  },
])

const schema = z.object({
  email: z.string().email('Invalid email'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
})
const isSubmitting = ref(false)
const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isSubmitting.value = true
    await $fetch('/api/subscribe', {
      method: 'POST',
      body: {
        email: event.data.email,
      },
    })
    toast.add({
      title: 'Success',
      description: 'The form has been submitted.',
      color: 'success',
    })
  } catch (error) {
    const msg = (error as { data: { message: string } }).data.message.includes(
      'D1_ERROR: UNIQUE constraint failed: subscribers.email: SQLITE_CONSTRAINT',
    )
      ? 'You are already subscribed to our newsletter.'
      : 'An unexpected error occurred'
    toast.add({
      title: 'Error',
      description: msg,
      color: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
