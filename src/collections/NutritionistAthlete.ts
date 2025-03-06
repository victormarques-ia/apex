import type { CollectionConfig } from 'payload'

export const NutritionistAthlete: CollectionConfig = {
  slug: 'nutritionist-athletes',
  admin: {
    useAsTitle: 'nutritionist',
  },
  fields: [
    {
      name: 'nutritionist',
      type: 'relationship',
      relationTo: 'nutritionists',
      required: true,
    },
    {
      name: 'athlete',
      type: 'relationship',
      relationTo: 'athlete-profiles',
      required: true,
    },
  ],
}