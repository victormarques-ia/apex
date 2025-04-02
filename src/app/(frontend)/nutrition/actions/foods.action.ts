'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to search for foods
export async function searchFoodsAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const query = data.q || data.query;
      const limit = data.limit || 10;

      if (!query || (query as string).length < 2) {
        console.log('Query is too short, returning empty array');
        return { docs: [] };
      }

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('q', query as string);
      queryParams.append('limit', limit as string);

      const endpoint = `/api/food/search?${queryParams.toString()}`;

      // Search for foods
      const result = await fetchFromApi(endpoint, {
        method: 'GET',
      });

      if (!result.data) {
        console.error('Food search API error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao pesquisar alimentos');
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
        console.error('Food search failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao pesquisar alimentos',
        };
      },
    }
  );
}

// Action to get a specific food by ID
export async function getFoodByIdAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const foodId = data.foodId;

      if (!foodId) {
        throw new Error('ID do alimento é obrigatório');
      }

      // Fetch the food details
      const result = await fetchFromApi(`/api/food/${foodId}`, {
        method: 'GET',
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao buscar alimento');
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
          message: 'Falha ao buscar alimento',
        };
      },
    }
  );
}

// Action to add a new food
export async function addFoodAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // Convert nutrition values to numbers
      const nutritionData = {
        name: data.name,
        calories_per_100g: data.calories_per_100g ? parseFloat(data.calories_per_100g as string) : null,
        protein_per_100g: data.protein_per_100g ? parseFloat(data.protein_per_100g as string) : null,
        carbs_per_100g: data.carbs_per_100g ? parseFloat(data.carbs_per_100g as string) : null,
        fat_per_100g: data.fat_per_100g ? parseFloat(data.fat_per_100g as string) : null,
      };

      const result = await fetchFromApi('/api/food', {
        method: 'POST',
        body: JSON.stringify(nutritionData),
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao adicionar alimento');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Alimento adicionado com sucesso',
        };
      },
      onFailure: (error) => {
        return {
          success: false,
          error,
          message: 'Falha ao adicionar alimento',
        };
      },
    }
  );
}

// Action to list foods with pagination
export async function listFoodsAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const limit = data.limit || 20;
      const page = data.page || 1;

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit as string);
      queryParams.append('page', page as string);

      if (data.sort) {
        queryParams.append('sort', data.sort as string);
      }

      // Fetch the foods list
      const result = await fetchFromApi(`/api/food?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao listar alimentos');
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
          message: 'Falha ao listar alimentos',
        };
      },
    }
  );
}
