'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'
import { error } from 'console';

// Action to get the pacient list
export async function getPacientList(_state: unknown, formData: FormData) {
    return actionHandlerWithValidation(
      formData,
      async (data) => {
        const limit = data.limit || 10;
        const page = data.page || 1;
        const name = data.name || "";
        const sortField = data.sortField || 0;
        const sortOrder = data.sortOrder || "asc";
        const goal = data.goal || "";
  
        // Build the query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit as string);
        queryParams.append('page', page as string);
        
        if (name) {
          queryParams.append('name', name as string);
        }
        
        if (sortField) {
          queryParams.append('sortField', sortField as string);
        }
        
        if (sortOrder) {
          queryParams.append('sortOrder', sortOrder as string);
        }
        
        if (goal) {
          queryParams.append('goal', goal as string);
        }
  
        // Fetch the athletes
        const result = await fetchFromApi(`/api/nutritionists/my-athletes?${queryParams.toString()}`, {
          method: 'GET',
        });

        console.log('Resultado: ', result);
        
        if (!result.data?.data) {
          throw new Error(result.error?.messages[0] || 'Erro ao buscar pacientes');
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
            message: 'Falha ao buscar pacientes',
          };
        },
      }
    );
  }
