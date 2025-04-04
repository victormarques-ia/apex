'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to add a new daily consumption record
export async function addConsumptionAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // Convert quantity_grams to a number
      const quantity_grams = parseFloat(data.quantity_grams as string);
      
      // Create a new consumption record through the PayloadCMS API
      const result = await fetchFromApi('/api/daily-consumption', {
        method: 'POST',
        body: JSON.stringify({
          athlete: parseInt(data.athleteId as string, 10),
          food: parseInt(data.foodId as string, 10),
          date: data.date,
          quantity_grams: quantity_grams,
        }),
      });

      console.log('Result:', result)

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao adicionar consumo');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Consumo adicionado com sucesso',
        };
      },
      onFailure: (error) => {
        return {
          success: false,
          error,
          message: 'Falha ao adicionar consumo',
        };
      },
    }
  );
}

// Action to update an existing daily consumption record
export async function updateConsumptionAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // Convert quantity_grams to a number
      const quantity_grams = parseFloat(data.quantity_grams as string);
      const id = data.id;
      
      if (!id) {
        throw new Error('ID do consumo é obrigatório para atualização');
      }

      // Update the consumption record through the PayloadCMS API
      const result = await fetchFromApi(`/api/daily-consumption/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          food: parseInt(data.foodId as string, 10),
          quantity_grams: quantity_grams, // don't update athlete or date for existing records
        }),
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao atualizar consumo');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Consumo atualizado com sucesso',
        };
      },
      onFailure: (error) => {
        return {
          success: false,
          error,
          message: 'Falha ao atualizar consumo',
        };
      },
    }
  );
}

// Action to delete a daily consumption record
export async function deleteConsumptionAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const id = data.id;
      
      if (!id) {
        throw new Error('ID do consumo é obrigatório para remoção');
      }

      // Delete the consumption record through the PayloadCMS API
      const result = await fetchFromApi(`/api/daily-consumption/${id}`, {
        method: 'DELETE',
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao remover consumo');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Consumo removido com sucesso',
        };
      },
      onFailure: (error) => {
        return {
          success: false,
          error,
          message: 'Falha ao remover consumo',
        };
      },
    }
  );
}

export async function getDailyConsumptionsAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const athleteId = data.athleteId;
      const from = data.from || undefined;
      const to = data.to || undefined;
      const limit = data.limit || 50;
      const page = data.page || 1;
      
      if (!athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('athleteId', athleteId as string);
      if (from) queryParams.append('from', from as string);
      if (to) queryParams.append('to', to as string);
      queryParams.append('limit', limit as string);
      queryParams.append('page', page as string);

      // Fetch the consumption records
      const result = await fetchFromApi(`/api/daily-consumption/history?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao buscar consumos');
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
          message: 'Falha ao buscar consumos',
        };
      },
    }
  );
}

// Action to get nutritional totals for a specific date range
export async function getNutritionalTotalsAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const athleteId = data.athleteId;
      const from = data.from || undefined;
      const to = data.to || undefined;
      const groupBy = data.groupBy || undefined; // Optional parameter for grouping (e.g., by date)
      
      if (!athleteId) {
        throw new Error('ID do atleta é obrigatório');
      }

      // Build the query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('athleteId', athleteId as string);
      if (from) queryParams.append('from', from as string);
      if (to) queryParams.append('to', to as string);
      if (groupBy) queryParams.append('groupBy', groupBy as string);

      // Fetch the nutrition totals
      const result = await fetchFromApi(`/api/daily-consumption/totals?${queryParams.toString()}`, {
        method: 'GET',
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao buscar totais nutricionais');
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
          message: 'Falha ao buscar totais nutricionais',
        };
      },
    }
  );
}
