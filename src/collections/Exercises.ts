import type { CollectionConfig } from 'payload'

export const Exercises: CollectionConfig = {
  slug: 'exercises',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'muscle_group',
      type: 'text',
      required: false,
    },
  ],
}
