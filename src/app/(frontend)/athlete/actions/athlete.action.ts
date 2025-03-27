'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to fetch the current athlete's profile
export async function getAthleteProfileAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async () => {
      // Fetch the athlete profile from the API
      const result = await fetchFromApi('/api/athlete-profiles/me', {
        method: 'GET',
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao buscar perfil de atleta');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
        };
      },
      onFailure: (error) => {
        return {
          success: false,
          error,
          message: 'Falha ao buscar perfil de atleta',
        };
      },
    }
  );
}
