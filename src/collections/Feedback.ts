import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedbacks',
  admin: {
    useAsTitle: 'message',
  },
  fields: [
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'receiver',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
  ],
}
