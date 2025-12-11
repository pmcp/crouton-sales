<template>
  <UNavigationMenu
    orientation="vertical"
    :items="navigationItems"
    class="w-full"
  />
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import { useTeam } from '@/composables/useTeam'

const { currentTeam } = useTeam()

const navigationItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'Events',
      icon: 'i-lucide-calendar',
      to: `/dashboard/${currentTeam.value.slug}/events`,
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
      icon: 'i-lucide-users',
      to: `/dashboard/${currentTeam.value.slug}/helpers`,
    },
    {
      label: 'Clients',
      icon: 'i-lucide-user',
      to: `/dashboard/${currentTeam.value.slug}/clients`,
    },
  ],
])
</script>
