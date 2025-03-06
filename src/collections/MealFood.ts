import type { CollectionConfig } from "payload";

export const MealFood: CollectionConfig = {
    slug: 'meal-food',
    admin: {
      useAsTitle: 'quantity_grams'
    },
    fields: [
      {
        name: 'meal',
        type: 'relationship',
        relationTo: 'meal',
        required: true
      },
      {
        name: 'food',
        type: 'relationship',
        relationTo: 'food',
        required: true
      },
      {
        name: 'quantity_grams',
        type: 'number',
        required: true
      }
    ],
  }