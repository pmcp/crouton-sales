<template>
  <header>
    <AppTeamDropdown />
  </header>
  <AppSidebarContent class="mt-2">
    <AppSidebarGroup>
      <AppSidebarLink v-for="link in links" :key="link.to" v-bind="link" />

      <USeparator class="my-4" />
      <AppSidebarGroupLabel>POS</AppSidebarGroupLabel>
      <AppSidebarLink v-for="link in posLinks" :key="link.to" v-bind="link" />

      <template v-if="isTeamOwner">
        <USeparator class="my-4" />
        <AppSidebarLink v-for="link in settings" :key="link.to" v-bind="link" />
      </template>
    </AppSidebarGroup>
  </AppSidebarContent>
</template>

<script lang="ts" setup>
import { useTeam } from '@/composables/useTeam'

const { isTeamOwner, currentTeam } = useTeam()

const links = computed(() => [
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
])

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
    icon: 'i-lucide-users-round',
    to: `/dashboard/${currentTeam.value.slug}/pos/helpers`,
  },
  {
    label: 'Clients',
    icon: 'i-lucide-user',
    to: `/dashboard/${currentTeam.value.slug}/pos/clients`,
  },
])

const settings = computed(() => [
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
</script>
