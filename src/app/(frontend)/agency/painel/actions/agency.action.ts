'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to get the nutritionist list
export async function getNutritionistList(_state: unknown, formData: FormData) {
    return actionHandlerWithValidation(
      formData,
      async (data) => {
        const limit = data.limit || 10;
        const page = data.page || 1;
        const name = data.name || "";
        const sortField = data.sortField || 0;
        const sortOrder = data.sortOrder || "asc";
        const specialization = data.specialization || "";
  
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
        
        if (specialization) {
          queryParams.append('specialization', specialization as string);
        }
  
        // Fetch the athletes
        // change to agency nutritionists api
        const result = await fetchFromApi(`/api/agencies/my-nutritionists?${queryParams.toString()}`, {
          method: 'GET',
        });
        
        if (!result.data?.data) {
          throw new Error(result.error?.messages[0] || 'Erro ao buscar nutricionistas');
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
            message: 'Falha ao buscar nutricionistas',
          };
        },
      }
    );
  }
  
