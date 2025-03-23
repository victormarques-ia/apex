'use server'

import { cookies } from 'next/headers'
import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

export async function signInAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const result = await fetchFromApi<{
        token: string
      }>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao efetuar login')
      }

      const co = await cookies()
      co.set('payload-token', result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      })

      return result.data
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
