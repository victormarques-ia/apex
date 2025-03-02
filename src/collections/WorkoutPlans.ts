import type { CollectionConfig } from 'payload'

export const WorkoutPlans: CollectionConfig = {
  slug: 'workout-plans',
  admin: {
    useAsTitle: 'start_date',
  },
  fields: [
    {
      name: 'athlete',
      type: 'relationship',
      relationTo: 'athlete-profiles',
      required: false,
    },
    {
      name: 'trainer',
      type: 'relationship',
      relationTo: 'trainers',
      required: false,
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
      name: 'goal',
      type: 'textarea',
      required: false,
    },
  ],
}
