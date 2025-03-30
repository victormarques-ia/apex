'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to get the pacient list
export async function getPacientList(_state: unknown, formData: FormData) {
    return actionHandlerWithValidation(
      formData,
      async (data) => {
        const limit = data.limit || 50;
        const page = data.page || 1;
  
        // Build the query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit as string);
        queryParams.append('page', page as string);
  
        // Fetch the consumption records
        const result = await fetchFromApi(`/api/nutritionists/my-athletes?${queryParams.toString()}`, {
          method: 'GET',
        });

        console.log('Resultado: ', result);

        
        if (!result.data?.data) {
          throw new Error(result.error?.messages[0] || 'Erro ao buscar atletas');
        }
  
        return result.data.data;
      },
      {
        onSuccess: (data) => {
          return {
            success: true,
            ...data,
          };
        },
        onFailure: (error) => {
          return {
            success: false,
            error,
            message: 'Falha ao buscar atletas',
          };
        },
      }
    );
  }
  
