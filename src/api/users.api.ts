import { withValidation } from '@/lib/utils'
import { Endpoint, PayloadRequest } from 'payload'
import { z } from 'zod'

const newsletterSchema = z.object({
  email: z
    .string({
      required_error: 'Por favor, insira um e-mail.',
    })
    .email('Por favor, insira um e-mail válido.'),
})

// Examples of API endpoints
export const UsersApi: Endpoint[] = [
  {
    method: 'post',
    path: '/newsletter',
    handler: withValidation(newsletterSchema)(async (req, validatedData) => {
      try {
        const { email } = validatedData

        // TODO: Register email in newsletter

        return Response.json({
          data: {
            message: `${email} cadastrado com sucesso na newsletter`,
          },
        })
      } catch (error) {
        console.error('[UsersApi][newsletter]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao cadastrar lead' }],
          },
          { status: 500 },
        )
      }
    }),
  },
  {
    method: 'get',
    path: '/leads',

    handler: async (req: PayloadRequest) => {
      try {
        const leads = await req.payload.find({
          collection: 'users',
        })
        return Response.json(leads)
      } catch (error) {
        console.error('[UsersApi][newsletter]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao pegar leads' }],
          },
          { status: 500 },
        )
      }
    },
  },
]
