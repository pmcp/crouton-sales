// Crouton configuration for FriendlyPOS collections
// Using enhanced format with per-collection schema files

export default {
  // Database dialect: 'sqlite' for D1/SQLite, 'pg' for PostgreSQL
  dialect: 'sqlite',

  // Collections with individual schema files (enhanced format)
  collections: [
    { name: 'events', fieldsFile: './schemas/events-schema.json' },
    { name: 'products', fieldsFile: './schemas/products-schema.json' },
    { name: 'productOptions', fieldsFile: './schemas/productOptions-schema.json' },
    { name: 'categories', fieldsFile: './schemas/categories-schema.json' },
    { name: 'locations', fieldsFile: './schemas/locations-schema.json' },
    { name: 'printers', fieldsFile: './schemas/printers-schema.json' },
    { name: 'orders', fieldsFile: './schemas/orders-schema.json' },
    { name: 'orderItems', fieldsFile: './schemas/orderItems-schema.json' },
    { name: 'helpers', fieldsFile: './schemas/helpers-schema.json' },
    { name: 'clients', fieldsFile: './schemas/clients-schema.json' },
    { name: 'eventSettings', fieldsFile: './schemas/eventSettings-schema.json' }
  ],

  // Target layers and collections to generate
  targets: [
    {
      layer: 'pos',  // All POS collections in one layer
      collections: [
        'events',
        'products',
        'productOptions',
        'categories',
        'locations',
        'printers',
        'orders',
        'orderItems',
        'helpers',
        'clients',
        'eventSettings'
      ]
    }
  ],

  // External collections from supersaas (already exist, don't generate)
  connectors: {
    teams: {
      type: 'supersaas',
      autoInstall: false  // Already in supersaas template
    },
    users: {
      type: 'supersaas',
      autoInstall: false
    }
  },

  // Generation flags
  flags: {
    // Team-based multi-tenancy: Adds teamId & userId fields to all collections
    useTeamUtility: true,

    // Metadata timestamps: Adds createdAt & updatedAt fields
    useMetadata: true,

    // Skip translation/i18n fields
    noTranslations: true,

    // Force overwrite existing files
    force: false,

    // Generate database tables
    noDb: false,

    // Actually create files (not just preview)
    dryRun: false
  }
}
