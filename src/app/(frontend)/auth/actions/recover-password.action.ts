'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'

export async function recoverPasswordAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      return {
        token: 'test',
      }
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
