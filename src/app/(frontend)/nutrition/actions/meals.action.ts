'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

/**
 * Action to fetch meal history for a specific athlete and date range
 */
export async function getMealHistoryAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const athleteId = data.athleteId;
      const from = data.from || data.startDate;
      const to = data.to || data.endDate;
      
      if (!athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('athleteId', athleteId as string);
      
      if (from) {
        queryParams.append('from', from as string);
      }
      
      if (to) {
        queryParams.append('to', to as string);
      }
      
      // Fetch the meal history
      const result = await fetchFromApi(`/api/meal/history?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!result.data) {
        console.error('Meal history API error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao buscar histórico de refeições');
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
        console.error('Meal history fetch failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao buscar histórico de refeições',
        };
      },
    }
  );
}

/**
 * Action to fetch all meals for a specific diet plan day
 */
export async function getMealsByDietPlanDayAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const dietPlanDayId = data.dietPlanDayId;
      
      if (!dietPlanDayId) {
        throw new Error('ID do dia do plano alimentar é obrigatório');
      }

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('where', JSON.stringify({
        diet_plan_day: {
          equals: dietPlanDayId,
        },
      }));
      queryParams.append('depth', '1');
      
      // Fetch the meals for the diet plan day
      const result = await fetchFromApi(`/api/meal?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!result.data) {
        console.error('Meals API error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao buscar refeições');
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
        console.error('Meals fetch failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao buscar refeições',
        };
      },
    }
  );
}

/**
 * Action to fetch meals for a date range
 */
export async function getMealsByDateRangeAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const athleteId = data.athleteId;
      const startDate = data.startDate;
      const endDate = data.endDate;
      
      if (!athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }
      
      if (!startDate) {
        throw new Error('Data inicial é obrigatória');
      }
      
      if (!endDate) {
        throw new Error('Data final é obrigatória');
      }

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('athleteId', athleteId as string);
      queryParams.append('startDate', startDate as string);
      queryParams.append('endDate', endDate as string);
      
      // Fetch the meals for the date range
      const result = await fetchFromApi(`/api/meal/range?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!result.data) {
        console.error('Meals by date range API error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao buscar refeições por período');
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
        console.error('Meals by date range fetch failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao buscar refeições por período',
        };
      },
    }
  );
}
