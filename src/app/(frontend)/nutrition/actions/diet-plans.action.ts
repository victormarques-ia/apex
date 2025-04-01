'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

/**
 * Action to create a new diet plan
 */
export async function createDietPlanAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const athleteId = data.athleteId;
      const nutritionistId = data.nutritionistId;
      const startDate = data.startDate || new Date().toISOString().split('T')[0];
      
      if (!athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }
      
      if (!nutritionistId) {
        throw new Error('ID do nutricionista é obrigatório');
      }
      
      // Calculate end date (10 years from start date)
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 10);
      
      const dietPlanData = {
        athleteId: athleteId,
        nutritionistId: nutritionistId,
        start_date: startDate,
        end_date: endDate.toISOString().split('T')[0],
        total_daily_calories: data.total_daily_calories || 2000,
        notes: data.notes || 'Plano alimentar criado automaticamente'
      };
      
      // Create a new diet plan
      const result = await fetchFromApi('/api/diet-plans', {
        method: 'POST',
        body: JSON.stringify(dietPlanData),
      });

      if (!result.data) {
        console.error('Diet plan creation error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao criar plano alimentar');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Plano alimentar criado com sucesso',
        };
      },
      onFailure: (error) => {
        console.error('Diet plan creation failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao criar plano alimentar',
        };
      },
    }
  );
}

/**
 * Action to get diet plans for a specific athlete and nutritionist
 */
export async function getDietPlansAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const athleteId = data.athleteId;
      const nutritionistId = data.nutritionistId;
      
      if (!athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }
      
      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('athleteId', athleteId as string);
      
      // Fetch diet plans
      const result = await fetchFromApi(`/api/nutritionists/diet-plans?${queryParams.toString()}`, {
        method: 'GET',
      });

      return result.data;

      if (result.totalDocs === 0) {
        console.error('Diet plans fetch error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao buscar planos alimentares');
      }

      return result.docs;
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
          message: 'Falha ao buscar planos alimentares',
        };
      },
    }
  );
}

/**
 * Action to create a diet plan day
 */
export async function createDietPlanDayAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const dietPlanId = data.dietPlanId;
      const date = data.date;
      const repeatIntervalDays = data.repeatIntervalDays || 7;
      
      if (!dietPlanId) {
        throw new Error('ID do plano alimentar é obrigatório');
      }
      
      if (!date) {
        throw new Error('Data é obrigatória');
      }
      
      const dietPlanDayData = {
        diet_plan: dietPlanId,
        date: date,
        repeat_interval_days: repeatIntervalDays,
      };
      
      // Create a new diet plan day
      const result = await fetchFromApi('/api/diet-plan-days', {
        method: 'POST',
        body: JSON.stringify(dietPlanDayData),
      });

      if (!result.data) {
        console.error('Diet plan day creation error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao criar dia do plano alimentar');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Dia do plano alimentar criado com sucesso',
        };
      },
      onFailure: (error) => {
        console.error('Diet plan day creation failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao criar dia do plano alimentar',
        };
      },
    }
  );
}

/**
 * Action to delete a diet plan day
 */
export async function deleteDietPlanDayAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const dietPlanDayId = data.dietPlanDayId;
      
      if (!dietPlanDayId) {
        throw new Error('ID do dia do plano alimentar é obrigatório');
      }
      
      // Delete the diet plan day
      const result = await fetchFromApi(`/api/diet-plan-days/${dietPlanDayId}`, {
        method: 'DELETE',
      });

      if (!result.data) {
        console.error('Diet plan day deletion error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao excluir dia do plano alimentar');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Dia do plano alimentar excluído com sucesso',
        };
      },
      onFailure: (error) => {
        console.error('Diet plan day deletion failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao excluir dia do plano alimentar',
        };
      },
    }
  );
}
