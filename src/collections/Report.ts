import type { CollectionConfig } from 'payload'

export const Report: CollectionConfig = {
  slug: 'reports',
  admin: {
    useAsTitle: 'content',
  },
  fields: [
    {
      name: 'created_by',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'athlete',
      type: 'relationship',
      relationTo: 'athlete-profiles',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'created_at',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
