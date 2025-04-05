'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to search for workoutPlans
export async function searchWorkoutPlansAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const athleteId = data.athleteId;
    const date = data.date;
    const workoutPlanId = data.workoutPlanId;
    


    // Build the query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('athleteId', athleteId as string);
    queryParams.append('date', date as string);
    queryParams.append('workoutPlanId', workoutPlanId as string);
    

    const endpoint = `/api/trainers/workout-plans?${queryParams.toString()}`;

    // Search for workoutPlans
    const result = await fetchFromApi(endpoint, {
        method: 'GET',
    });

    if (!result.data) {
        console.error('WorkoutPlan search API error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao pesquisar plano de treinos');
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
        console.error('WorkoutPlan search failure:', error);
        return {
        success: false,
        error,
        message: 'Falha ao pesquisar planos de treino',
        };
    },
    }
);
}
  
// Action to add a new workoutPlan
export async function addWorkoutPlanAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {

    const workoutPlanData = {
        athleteId: data.athleteId,
        startDate: data.startDate,
        endDate: data.endDate,
        goal: data.goal,
    }

    const result = await fetchFromApi('/api/trainers/workout-plans', {
        method: 'POST',
        body: JSON.stringify(workoutPlanData),
    });

    if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao adicionar plano de treino');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        return {
        success: true,
        data,
        message: 'Plano de treino adicionado com sucesso',
        };
    },
    onFailure: (error) => {
        return {
        success: false,
        error,
        message: 'Falha ao adicionar plano de treino',
        };
    },
    }
);
}
  
// Action to list workoutPlans with pagination
export async function updateWorkoutPlansAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const workoutPlanId = data.workoutPlanId;

    if (!workoutPlanId) {
        throw new Error('ID do plano de treino é obrigatório');
    }

    const workoutPlanData = {
        athleteId: data.athleteId,
        startDate: data.startDate,
        endDate: data.endDate,
        goal: data.goal,
    }

    // Fetch the workoutPlans list
    const result = await fetchFromApi(`/api/trainers/workout-plans/${workoutPlanId}`, {
        method: 'PUT',
        body: JSON.stringify(workoutPlanData),
    });

    if (!result.data || (result.data as any).success === false) {
        throw new Error(result.error?.messages[0] || 'Erro ao atualizar plano de treinos');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        return {
        success: true,
        data,
        message: 'Plano de treino atualizado com sucesso',
        };
    },
    onFailure: (error) => {
        return {
        success: false,
        error,
        message: 'Falha ao atualizar plano de treinos',
        };
    },
    }
);
}

export async function deleteWorkoutPlanAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const workoutPlanId = data.workoutPlanId;

    if (!workoutPlanId) {
        throw new Error('ID do plano de treino é obrigatório');
    }

    console.log('=================================================================');
    console.log('Deleting workoutPlan day with ID:', workoutPlanId);
    console.log('=================================================================');
    // Delete the workoutPlan day and all associated entities
    const result = await fetchFromApi(`/api/trainers/workout-plans/${workoutPlanId}`, {
        method: 'DELETE',
    });

    console.log('Result of workoutPlan deletion:', result);

    if (!result.data || (result.data as any).success === false) {
        console.error('WorkoutPlan deletion error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao excluir plano de treino');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        console.log('WorkoutPlan deleted successfully:', data);
        return {
        success: true,
        data,
        message: 'Plano de treino excluído com sucesso',
        };
    },
    onFailure: (error) => {
        console.error('WorkoutPlan deletion failure:', error);
        return {
        success: false,
        error,
        message: 'Falha ao excluir plano de treino',
        };
    },
    }
);
}