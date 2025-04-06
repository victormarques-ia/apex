'use server'

import { cookies } from 'next/headers'
import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

export async function signOutAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async () => {
      await fetchFromApi('/api/users/logout', {
        method: 'POST',
      })

      const co = await cookies()
      co.set('payload-token', '', {
        expires: new Date(0),
        path: '/',
      })

      return { success: true }
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
