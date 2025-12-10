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

const { isTeamOwner, currentTeam } = useTeam()

const navigationItems = computed<NavigationMenuItem[][]>(() => {
  const items: NavigationMenuItem[][] = [
    // Main links group
    [
      {
        label: 'Home',
        icon: 'i-lucide-home',
        to: `/dashboard/${currentTeam.value.slug}`,
      },
      {
        label: 'Posts',
        icon: 'i-lucide-file-text',
        to: `/dashboard/${currentTeam.value.slug}/posts`,
      },
    ],
    // POS group
    [
      {
        label: 'POS',
        type: 'label',
      },
      {
        label: 'Events',
        icon: 'i-lucide-calendar',
        to: `/dashboard/${currentTeam.value.slug}/pos`,
      },
      {
        label: 'Orders',
        icon: 'i-lucide-receipt',
        to: `/dashboard/${currentTeam.value.slug}/pos/orders`,
      },
      {
        label: 'Products',
        icon: 'i-lucide-package',
        to: `/dashboard/${currentTeam.value.slug}/pos/products`,
      },
      {
        label: 'Categories',
        icon: 'i-lucide-folder',
        to: `/dashboard/${currentTeam.value.slug}/pos/categories`,
      },
      {
        label: 'Locations',
        icon: 'i-lucide-map-pin',
        to: `/dashboard/${currentTeam.value.slug}/pos/locations`,
      },
      {
        label: 'Printers',
        icon: 'i-lucide-printer',
        to: `/dashboard/${currentTeam.value.slug}/pos/printers`,
      },
      {
        label: 'Helpers',
        icon: 'i-lucide-users-round',
        to: `/dashboard/${currentTeam.value.slug}/pos/helpers`,
      },
      {
        label: 'Clients',
        icon: 'i-lucide-user',
        to: `/dashboard/${currentTeam.value.slug}/pos/clients`,
      },
    ],
  ]

  // Settings group (only for team owners)
  if (isTeamOwner.value) {
    items.push([
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
      {
        label: 'Billing',
        icon: 'i-lucide-credit-card',
        to: `/dashboard/${currentTeam.value.slug}/settings/billing`,
      },
    ])
  }

  return items
})
</script>
