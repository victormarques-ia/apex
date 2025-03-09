import type { CollectionConfig } from "payload";

export const HydrationLog: CollectionConfig = {
    slug: 'hydration-log',
    admin: {
      useAsTitle: 'date'
    },
    fields: [
      {
        name: 'athlete',
        type: 'relationship',
        relationTo: 'athlete-profiles',
        required: false
      },
      {
        name: 'date',
        type: 'date',
        required: true
      },
      {
        name: 'amount_ml',
        type: 'number',
        required: true
      }
    ],
  }