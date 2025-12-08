import { basename } from 'path'

const layerName = basename(__dirname)

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: './components',
        prefix: layerName,
        global: true // Makes them available globally
      }
    ]
  },
  extends: [
    './collections/events',
    './collections/products',
    './collections/productoptions',
    './collections/categories',
    './collections/locations',
    './collections/printers',
    './collections/orders',
    './collections/orderitems',
    './collections/helpers',
    './collections/clients',
    './collections/eventsettings'
  ]
})
