<template>
  <UModal v-model:open="isOpen">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-eye" class="w-5 h-5" />
        <span>Print Preview</span>
      </div>
    </template>

    <template #body>
      <div v-if="printer" class="space-y-4">
        <!-- Printer Info -->
        <UCard>
          <div class="space-y-3">
            <h4 class="font-medium">Printer Information</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Name:</span>
                {{ printer.title }}
              </div>
              <div>
                <span class="font-medium">IP Address:</span>
                {{ printer.ipAddress }}:{{ printer.port || '9100' }}
              </div>
              <div>
                <span class="font-medium">Location:</span>
                {{ printer.locationIdData?.title || 'None' }}
              </div>
              <div>
                <span class="font-medium">Status:</span>
                <UBadge
                  :color="printer.isActive ? 'success' : 'neutral'"
                  variant="soft"
                  size="xs"
                  class="ml-1"
                >
                  {{ printer.isActive ? 'Active' : 'Inactive' }}
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Receipt Preview -->
        <UCard class="bg-gray-50 dark:bg-gray-900">
          <div class="flex justify-center">
            <div
              class="bg-white shadow-xl rounded-lg overflow-hidden"
              style="width: 320px; font-family: 'Courier New', monospace;"
            >
              <div class="p-4" style="background: linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%);">
                <!-- Header -->
                <div class="text-center border-b-2 border-dashed border-gray-400 pb-2 mb-2">
                  <div class="font-bold text-lg">{{ receiptSettings.test_title }}</div>
                </div>

                <!-- Printer Details -->
                <div class="text-sm py-2">
                  <div>Printer: {{ printer.title }}</div>
                  <div>IP: {{ printer.ipAddress }}:{{ printer.port || '9100' }}</div>
                  <div>Time: {{ currentTime }}</div>
                </div>

                <div class="border-t-2 border-dashed border-gray-400 my-2"></div>

                <!-- Sample Order -->
                <div class="font-bold text-lg py-1">Sample Order #12345</div>

                <div class="text-sm py-1 font-bold">{{ receiptSettings.items_section_title }}</div>

                <div class="text-sm space-y-1">
                  <div class="flex justify-between">
                    <span>1x Sample Product</span>
                    <span v-if="printer.showPrices">$10.00</span>
                  </div>
                  <div class="flex justify-between">
                    <span>2x Another Item</span>
                    <span v-if="printer.showPrices">$15.00</span>
                  </div>
                </div>

                <div class="border-t-2 border-dashed border-gray-400 my-2"></div>

                <div class="text-sm py-1 font-bold">{{ receiptSettings.special_instructions_title }}</div>
                <div class="text-sm">Please serve with extra napkins</div>

                <div class="border-t-2 border-dashed border-gray-400 my-2"></div>

                <div v-if="printer.showPrices" class="flex justify-between font-bold text-lg py-1">
                  <span>TOTAL:</span>
                  <span>$25.00</span>
                </div>

                <div class="border-t-2 border-dashed border-gray-400 my-2"></div>

                <!-- Footer -->
                <div class="text-center text-sm py-2">
                  {{ receiptSettings.footer_text }}
                </div>

                <!-- Tear edge effect -->
                <div
                  class="mt-4 -mx-4 h-4"
                  style="background: repeating-linear-gradient(90deg, transparent 0, transparent 6px, #e5e5e5 6px, #e5e5e5 8px);"
                ></div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Info Alert -->
        <UAlert
          icon="i-lucide-info"
          color="info"
          variant="soft"
          title="Preview Information"
        >
          <template #description>
            This shows how receipts will look when printed. The actual content will include real order data.
          </template>
        </UAlert>
      </div>
      <div v-else class="p-8 text-center text-muted">
        No printer selected
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="outline" @click="close">
          Close
        </UButton>
        <UButton
          v-if="printer"
          color="primary"
          icon="i-lucide-printer"
          :loading="testPrinting"
          :disabled="!printer.isActive"
          @click="testPrint"
        >
          Test Print
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface ReceiptSettings {
  items_section_title: string
  special_instructions_title: string
  complete_order_header: string
  staff_order_header: string
  footer_text: string
  test_title: string
  test_success_message: string
}

interface Printer {
  id: string
  title: string
  ipAddress: string
  port?: string
  isActive: boolean
  showPrices: boolean
  locationIdData?: {
    title: string
  }
}

const props = defineProps<{
  modelValue: boolean
  printer: Printer | null
  teamId: string
  receiptSettings: ReceiptSettings
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'test-print': [printer: Printer]
}>()

const toast = useToast()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const testPrinting = ref(false)

const currentTime = computed(() => new Date().toLocaleString())

async function testPrint() {
  if (!props.printer) return

  testPrinting.value = true
  try {
    await $fetch(
      `/api/teams/${props.teamId}/pos-printers/${props.printer.id}/test`,
      { method: 'POST' }
    )
    toast.add({
      title: 'Test Print Queued',
      description: 'A test print job has been sent to the printer.',
      color: 'success'
    })
    emit('test-print', props.printer)
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to send test print.',
      color: 'error'
    })
  } finally {
    testPrinting.value = false
  }
}

function close() {
  isOpen.value = false
}
</script>
