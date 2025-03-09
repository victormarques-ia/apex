import type { CollectionConfig } from 'payload'

export const DietPlanDays: CollectionConfig = {
  slug: 'diet-plan-days',
  admin: {
    useAsTitle: 'date',
  },
  fields: [
    {
      name: 'diet_plan',
      type: 'relationship',
      relationTo: 'diet-plans',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'day_of_week',
      type: 'text',
      required: false,
    },
  ],
}
