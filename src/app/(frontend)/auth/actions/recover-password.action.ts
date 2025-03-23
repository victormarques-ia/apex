'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

export async function recoverPasswordAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const result = await fetchFromApi('/api/users/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
        }),
      })

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao tentar recuperar senha')
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
