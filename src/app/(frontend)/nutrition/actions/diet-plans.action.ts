'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

/**
 * Action to get a diet plan with its associated diet plan day
 */
export async function getDietPlanAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const dietPlanId = data.dietPlanId;

      if (!dietPlanId) {
        throw new Error('ID do plano alimentar é obrigatório');
      }

      // Fetch diet plan with its diet plan day
      const result = await fetchFromApi(`/api/nutritionists/diet-plan/${dietPlanId}`, {
        method: 'GET',
      });

      if (!result.data) {
        throw new Error('Plano alimentar não encontrado');
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
          message: 'Falha ao buscar plano alimentar',
        };
      },
    }
  );
}

export async function getAthleteDietPlanDaysAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const athleteId = data.athleteId;
      const dietPlanId = data.dietPlanId;

      if (!athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('athleteId', athleteId as string);
      queryParams.append('dietPlanId', dietPlanId as string);

      // Fetch diet plans
      const result = await fetchFromApi(`/api/nutritionists/diet-plan-days?${queryParams.toString()}`, {
        method: 'GET',
      });

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
          message: 'Falha ao buscar planos alimentares',
        };
      },
    }
  );

}

/**
 * Action to get diet plans for a specific athlete
 */
export async function getAthleteDietPlansAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const athleteId = data.athleteId;
      // Only include date in query if provided
      const date = data.date || null;

      if (!athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('athleteId', athleteId as string);

      if (date) {
        queryParams.append('date', date as string);
      }

      // Fetch diet plans
      const result = await fetchFromApi(`/api/nutritionists/diet-plans?${queryParams.toString()}`, {
        method: 'GET',
      });

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
          message: 'Falha ao buscar planos alimentares',
        };
      },
    }
  );
}

/**
 * Action to create a diet plan with its diet plan day in one operation
 */
export async function createDietPlanAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // Validate required fields
      if (!data.athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }

      if (!data.startDate) {
        throw new Error('Data de início é obrigatória');
      }

      if (!data.endDate) {
        throw new Error('Data de término é obrigatória');
      }

      if (!data.dayDate) {
        throw new Error('Data do dia do plano é obrigatória');
      }

      // Prepare request data
      const requestData = {
        athleteId: data.athleteId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDailyCalories: data.totalDailyCalories || 0,
        notes: data.notes || '',
        dayDate: data.dayDate,
        dayOfWeek: data.dayOfWeek,
        repeatIntervalDays: data.repeatIntervalDays || 7,
        initialMeal: data.initialMeal ? {
          mealType: data.initialMeal.mealType || 'Café da manhã',
          scheduledTime: data.initialMeal.scheduledTime,
          orderIndex: data.initialMeal.orderIndex || 0
        } : null
      };

      // Create diet plan with its day
      const result = await fetchFromApi('/api/nutritionists/create-diet-plan', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!result.data) {
        console.error('Diet plan creation error:', result.errors);
        throw new Error(result.errors?.[0]?.message || 'Erro ao criar plano alimentar');
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
 * Action to update an existing diet plan
 */
export async function updateDietPlanAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const dietPlanId = data.dietPlanId;

      if (!dietPlanId) {
        throw new Error('ID do plano alimentar é obrigatório');
      }

      // Prepare update data
      const updateData = {
        startDate: data.startDate,
        endDate: data.endDate,
        totalDailyCalories: data.totalDailyCalories,
        notes: data.notes,
        dietPlanDay: {
          date: data.dayDate,
          dayOfWeek: data.dayOfWeek,
          repeatIntervalDays: data.repeatIntervalDays
        }
      };

      // Update the diet plan
      const result = await fetchFromApi(`/api/nutritionists/diet-plan/${dietPlanId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (!result.data || !result.data.success) {
        console.error('Diet plan update error:', result.errors);
        throw new Error(result.errors?.[0]?.message || 'Erro ao atualizar plano alimentar');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Plano alimentar atualizado com sucesso',
        };
      },
      onFailure: (error) => {
        console.error('Diet plan update failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao atualizar plano alimentar',
        };
      },
    }
  );
}

/**
 * Action to delete a diet plan and all associated entities
 */
export async function deleteDietPlanAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const dietPlanId = data.dietPlanId;

      if (!dietPlanId) {
        throw new Error('ID do plano alimentar é obrigatório');
      }

      console.log('=================================================================');
      console.log('Deleting diet plan with ID:', dietPlanId);
      console.log('=================================================================');
      // Delete the diet plan and all associated entities
      const result = await fetchFromApi(`/api/nutritionists/diet-plan/${dietPlanId}`, {
        method: 'DELETE',
      });

      console.log('Result of diet plan deletion:', result);

      if (!result.data || !result.data.success) {
        console.error('Diet plan deletion error:', result.errors);
        throw new Error(result.error?.messages[0] || 'Erro ao excluir plano alimentar');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        console.log('Diet plan deleted successfully:', data);
        return {
          success: true,
          data,
          message: 'Plano alimentar excluído com sucesso',
        };
      },
      onFailure: (error) => {
        console.error('Diet plan deletion failure:', error);
        return {
          success: false,
          error,
          message: 'Falha ao excluir plano alimentar',
        };
      },
    }
  );
}
