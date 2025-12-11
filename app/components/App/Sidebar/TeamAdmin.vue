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
  // POS group
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
    {
      label: 'Products',
      icon: 'i-lucide-package',
      to: `/dashboard/${currentTeam.value.slug}/products`,
    },
    {
      label: 'Categories',
      icon: 'i-lucide-folder',
      to: `/dashboard/${currentTeam.value.slug}/categories`,
    },
    {
      label: 'Locations',
      icon: 'i-lucide-map-pin',
      to: `/dashboard/${currentTeam.value.slug}/locations`,
    },
    {
      label: 'Printers',
      icon: 'i-lucide-printer',
      to: `/dashboard/${currentTeam.value.slug}/printers`,
    },
    {
      label: 'Helpers',
      icon: 'i-lucide-users-round',
      to: `/dashboard/${currentTeam.value.slug}/helpers`,
    },
    {
      label: 'Clients',
      icon: 'i-lucide-user',
      to: `/dashboard/${currentTeam.value.slug}/clients`,
    },
  ],
  // Settings group
  [
    {
      label: 'Workspace Settings',
      icon: 'i-lucide-settings',
      to: `/dashboard/${currentTeam.value.slug}/settings`,
    },
    {
      label: 'Workspace Members',
      icon: 'i-lucide-users',
      to: `/dashboard/${currentTeam.value.slug}/settings/members`,
    },
  ],
])
</script>
