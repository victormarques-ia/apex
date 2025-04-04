import { AgencyApi } from '@/api/agency.api'
import type { CollectionConfig } from 'payload'

export const Agencies: CollectionConfig = {
  slug: 'agencies',
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'contact_info',
      type: 'text',
    },
  ],
  endpoints: AgencyApi,
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({}) => false,
  },
}
