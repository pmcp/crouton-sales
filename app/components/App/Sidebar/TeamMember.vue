<template>
  <header>
    <AppTeamDropdown />
  </header>
  <AppSidebarContent class="mt-2">
    <UNavigationMenu
      orientation="vertical"
      :items="navigationItems"
      class="w-full"
    />
  </AppSidebarContent>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import { useTeam } from '@/composables/useTeam'

const { currentTeam } = useTeam()

const navigationItems = computed<NavigationMenuItem[][]>(() => [
  // Main links group
  [
    {
      label: 'Home',
      icon: 'i-lucide-home',
      to: `/dashboard/${currentTeam.value.slug}`,
    },
  ],
  // Limited POS group (member access only)
  [
    {
      label: 'Events',
      icon: 'i-lucide-calendar',
      to: `/dashboard/${currentTeam.value.slug}/events`,
    },
    {
      label: 'Orders',
      icon: 'i-lucide-receipt',
      to: `/dashboard/${currentTeam.value.slug}/orders`,
    },
  ],
])
</script>
