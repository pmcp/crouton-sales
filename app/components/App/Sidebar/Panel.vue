<template>
  <!-- Desktop sidebar - always rendered, visibility controlled by CSS -->
  <div
    class="relative hidden w-0 flex-col items-stretch overflow-hidden border-r border-neutral-200 bg-neutral-100 p-2 lg:flex lg:w-64 dark:border-neutral-900 dark:bg-black"
  >
    <slot />
  </div>
  <!-- Mobile slideover - always rendered, only opens when model is true -->
  <USlideover
    v-model:open="model"
    side="left"
    :ui="{ content: 'max-w-[75%] sm:max-w-[50%]' }"
  >
    <template #content>
      <div class="flex h-full flex-col p-2">
        <slot />
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>({ required: true })
</script>
