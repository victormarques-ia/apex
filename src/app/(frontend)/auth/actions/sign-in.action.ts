'use server'

import { di } from '@/app/di'
import { cookies } from 'next/headers'
import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'

export async function signInAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
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
      onSuccess: (data) => {
        return data
      },
      onFailure: (error) => {
        return error
      },
    },
  )
}
