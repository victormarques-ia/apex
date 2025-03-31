import { TrainerApi } from '@/api/trainer.api'
import type { CollectionConfig } from 'payload'

export const Trainers: CollectionConfig = {
  slug: 'trainers',
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
      name: 'certification',
      type: 'text',
      required: false,
    },
    {
      name: 'specialization',
      type: 'text',
      required: false,
    },
  ],
  endpoints: TrainerApi,
}
