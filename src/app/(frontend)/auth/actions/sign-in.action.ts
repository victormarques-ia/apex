'use server'

import { di } from '@/app/di'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { redirect } from 'next/navigation'

const schema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
})

export async function signInAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    schema,
    async (data) => {
      const { user, token } = await di.authService.login(data.email, data.password)

      if (!user || !token) {
        throw new Error('Usuário ou senha inválidos')
      }

      const co = await cookies()
      co.set('payload-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })

      return user
    },
    {
      onSuccess: (_) => {
        redirect('/home')
      },
      onFailure: (error) => {
        return error
      },
    },
  )
}
