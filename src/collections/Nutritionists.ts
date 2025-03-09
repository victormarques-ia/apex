import type { CollectionConfig } from 'payload'

export const Nutritionists: CollectionConfig = {
  slug: 'nutritionists',
  admin: {
    useAsTitle: 'user',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'license_number',
      type: 'text',
      required: false,
    },
    {
      name: 'specialization',
      type: 'text',
      required: false,
    },
  ],
}
