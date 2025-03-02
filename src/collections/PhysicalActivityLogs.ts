import type { CollectionConfig } from 'payload'

export const PhysicalActivityLog: CollectionConfig = {
  slug: 'physical-activity-logs',
  admin: {
    useAsTitle: 'date',
  },
  fields: [
    {
      name: 'athlete',
      type: 'relationship',
      relationTo: 'athlete-profiles',
      required: true,
    },
    {
      name: 'workout_plan',
      type: 'relationship',
      relationTo: 'workout-plans',
      required: false,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'duration_minutes',
      type: 'number',
      required: true,
    },
    {
      name: 'calories_burned',
      type: 'number',
      required: false,
    },
  ],
}
