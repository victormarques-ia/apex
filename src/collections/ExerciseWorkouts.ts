import type { CollectionConfig } from 'payload'

export const ExerciseWorkouts: CollectionConfig = {
  slug: 'exercise-workouts',
  admin: {
    useAsTitle: 'exercise',
  },
  fields: [
    {
      name: 'workout_plan',
      type: 'relationship',
      relationTo: 'workout-plans',
      required: true,
    },
    {
      name: 'exercise',
      type: 'relationship',
      relationTo: 'exercises',
      required: true,
    },
    {
      name: 'sets',
      type: 'number',
      required: true,
    },
    {
      name: 'reps',
      type: 'number',
      required: true,
    },
    {
      name: 'rest_seconds',
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
