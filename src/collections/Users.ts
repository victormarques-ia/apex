import { UsersApi } from '@/api/users.api'
import type { CollectionConfig } from 'payload'

const BASE_URL = process.env.PAYLOAD_PUBLIC_SITE_URL || 'http://localhost:3000'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: ({
        token,
        user,
      }: {
        token?: string
        user?: { email: string }
      } = {}) => {
        const resetPasswordURL = `${BASE_URL}/auth/redefine-password?token=${token}`

        return `
          <!doctype html>
          <html>
            <body>
              <h1>Apex</h1>
              <p>Olá, ${user?.email || 'usuário'}!</p>
              <p>Clique abaixo para redefinir sua senha.</p>
              <p>
                <a href="${resetPasswordURL}">${resetPasswordURL}</a>
              </p>
            </body>
          </html>
        `
      },
    },
  },
  access: {
    read: async ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({}) => false,
  },
  fields: [
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
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
  endpoints: UsersApi,
}
