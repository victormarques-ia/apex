import type { CollectionConfig } from 'payload'

export const TrainerAthletes: CollectionConfig = {
  slug: 'trainer-athletes',
  admin: {
    useAsTitle: 'trainer',
  },
  fields: [
    {
      name: 'trainer',
      type: 'relationship',
      relationTo: 'trainers',
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
