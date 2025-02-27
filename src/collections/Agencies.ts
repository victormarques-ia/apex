import type { CollectionConfig } from 'payload'

export const Agencies: CollectionConfig = {
  slug: 'agencies',
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
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'contact_info',
      type: 'text',
    },
  ],
}
