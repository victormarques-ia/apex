import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PayloadRequest } from 'payload'
import { z, ZodSchema } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const withValidation = (schema: ZodSchema) => {
  return (handler: (req: PayloadRequest, data: z.infer<typeof schema>) => Promise<Response>) => {
    return async (req: PayloadRequest) => {
      try {
        const data = await req.json!()
        const validationResult = schema.safeParse(data)

        if (!validationResult.success) {
          return Response.json(
            {
              errors: validationResult.error.errors.map((error) => ({
                message: error.message,
              })),
            },
            { status: 400 },
          )
        }

        return handler(req, validationResult.data)
      } catch (error) {
        console.error('[Validation middleware error]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro ao processar o corpo da requisição' }],
          },
          { status: 400 },
        )
      }
    }
  }
}
