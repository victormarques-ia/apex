import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: async ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({}) => false,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Athlete', value: 'athlete' },
        { label: 'Nutritionist', value: 'nutritionist' },
        { label: 'Trainer', value: 'trainer' },
        { label: 'Agency', value: 'agency' },
      ],
      required: true,
      defaultValue: 'user',
    },
  ],
}
