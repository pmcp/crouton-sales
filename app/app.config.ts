import { posEventsConfig } from '../layers/pos/collections/events/app/composables/usePosEvents'
import { posProductsConfig } from '../layers/pos/collections/products/app/composables/usePosProducts'
import { posProductOptionsConfig } from '../layers/pos/collections/productoptions/app/composables/usePosProductOptions'
import { posCategoriesConfig } from '../layers/pos/collections/categories/app/composables/usePosCategories'
import { posLocationsConfig } from '../layers/pos/collections/locations/app/composables/usePosLocations'
import { posPrintersConfig } from '../layers/pos/collections/printers/app/composables/usePosPrinters'
import { posOrdersConfig } from '../layers/pos/collections/orders/app/composables/usePosOrders'
import { posOrderItemsConfig } from '../layers/pos/collections/orderitems/app/composables/usePosOrderItems'
import { posHelpersConfig } from '../layers/pos/collections/helpers/app/composables/usePosHelpers'
import { posClientsConfig } from '../layers/pos/collections/clients/app/composables/usePosClients'
import { posEventSettingsConfig } from '../layers/pos/collections/eventsettings/app/composables/usePosEventSettings'

export default defineAppConfig({
  croutonCollections: {
    posEventSettings: posEventSettingsConfig,
    posClients: posClientsConfig,
    posHelpers: posHelpersConfig,
    posOrderItems: posOrderItemsConfig,
    posOrders: posOrdersConfig,
    posPrinters: posPrintersConfig,
    posLocations: posLocationsConfig,
    posCategories: posCategoriesConfig,
    posProductOptions: posProductOptionsConfig,
    posProducts: posProductsConfig,
    posEvents: posEventsConfig,
  },
  ui: {
    icons: {
      loading: 'i-lucide-loader-circle',
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
    },
    colors: {
      primary: 'emerald',
      neutral: 'neutral',
    },
  },
  seo: {
    title: 'Supersaas',
    description: 'The fullstack Nuxt 3 SaaS starter kit',
  },
})
