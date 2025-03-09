import type { CollectionConfig } from 'payload'

export const AgencyProfessional: CollectionConfig = {
  slug: 'agency-professionals',
  admin: {
    useAsTitle: 'role',
  },
  fields: [
    {
      name: 'agency',
      type: 'relationship',
      relationTo: 'agencies',
      required: true,
    },
    {
      name: 'professional',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      required: true,
    },
  ],
}