import type { CollectionConfig } from 'payload'

export const AthleteProfiles: CollectionConfig = {
  slug: 'athlete-profiles',
  admin: {
    useAsTitle: 'user',
  },
  fields: [
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'weight',
      type: 'number',
      required: false,
    },
    {
      name: 'height',
      type: 'number',
      required: false,
    },
    {
      name: 'dietary_habits',
      type: 'textarea',
      required: false,
    },
    {
      name: 'physical_activity_habits',
      type: 'textarea',
      required: false,
    },
    {
      name: 'birth_date',
      type: 'date',
      required: false,
    },
    {
      name: 'gender',
      type: 'text',
      required: false,
    },
    {
      name: 'goal',
      type: 'textarea',
      required: false,
    },
  ],
}
