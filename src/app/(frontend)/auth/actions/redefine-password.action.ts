'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'

export async function redefinePasswordAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async () => {
      return {}
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
