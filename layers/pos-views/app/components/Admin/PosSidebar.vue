<template>
  <AppSidebarGroup>
    <AppSidebarGroupLabel>POS</AppSidebarGroupLabel>
    <AppSidebarLink v-for="link in posLinks" :key="link.to" v-bind="link" />
  </AppSidebarGroup>
</template>

<script lang="ts" setup>
import { useTeam } from '@/composables/useTeam'

const { currentTeam } = useTeam()

const posLinks = computed(() => [
  {
    label: 'Events',
    icon: 'i-lucide-calendar',
    to: `/dashboard/${currentTeam.value.slug}/pos`,
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
    icon: 'i-lucide-users',
    to: `/dashboard/${currentTeam.value.slug}/pos/helpers`,
  },
  {
    label: 'Clients',
    icon: 'i-lucide-user',
    to: `/dashboard/${currentTeam.value.slug}/pos/clients`,
  },
])
</script>
