import type { CollectionConfig } from 'payload'

export const DietPlans: CollectionConfig = {
  slug: 'diet-plans',
  admin: {
    useAsTitle: 'start_date',
  },
  fields: [
    {
      name: 'athlete',
      type: 'relationship',
      relationTo: 'athlete-profiles',
      required: true,
    },
    {
      name: 'nutritionist',
      type: 'relationship',
      relationTo: 'nutritionists',
      required: true,
    },
    {
      name: 'start_date',
      type: 'date',
      required: true,
    },
    {
      name: 'end_date',
      type: 'date',
      required: true,
    },
    {
      name: 'total_daily_calories',
      type: 'number',
      required: false,
    },
    {
      name: 'notes',
      type: 'textarea',
      required: false,
    },
  ],
}
