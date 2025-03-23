'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

export async function redefinePasswordAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const result = await fetchFromApi('/api/users/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          password: data.password,
          token: data.token,
        }),
      })

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao redefinir senha')
      }

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
