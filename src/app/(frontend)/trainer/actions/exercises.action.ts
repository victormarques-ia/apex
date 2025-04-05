'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to search for exercises
export async function searchExercisesAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const name = data.name;
    const muscleGroup = data.muscleGroup;

    // Build the query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('name', name as string);
    queryParams.append('muscleGroup', muscleGroup as string);

    const endpoint = `/api/trainers/exercises?${queryParams.toString()}`;

    // Search for exercises
    const result = await fetchFromApi(endpoint, {
        method: 'GET',
    });

    if (!result.data) {
        console.error('Exercise search API error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao pesquisar exercícios');
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
        console.error('Exercise search failure:', error);
        return {
        success: false,
        error,
        message: 'Falha ao pesquisar exercícios',
        };
    },
    }
);
}
  
// Action to add a new exercise
export async function addExerciseAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {

    const exerciseData = {
        name: data.name,
        description: data.description,
        muscleGroup: data.muscleGroup,
    }

    const result = await fetchFromApi('/api/trainers/exercises', {
        method: 'POST',
        body: JSON.stringify(exerciseData),
    });

    if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao adicionar exercício');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        return {
        success: true,
        data,
        message: 'Exercício adicionado com sucesso',
        };
    },
    onFailure: (error) => {
        return {
        success: false,
        error,
        message: 'Falha ao adicionar exercício',
        };
    },
    }
);
}
  
// Action to list exercises with pagination
export async function updateExercisesAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const exerciseId = data.exerciseId;

    if (!exerciseId) {
        throw new Error('ID do exercício é obrigatório');
    }

    const exerciseData = {
        name: data.name,
        description: data.description,
        muscleGroup: data.muscleGroup,
    }

    // Fetch the exercises list
    const result = await fetchFromApi(`/api/trainers/exercises/${exerciseId}`, {
        method: 'PUT',
        body: JSON.stringify(exerciseData),
    });

    if (!result.data || (result.data as any).success === false) {
        throw new Error(result.error?.messages[0] || 'Erro ao atualizar exercícios');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        return {
        success: true,
        data,
        message: 'Exercício atualizado com sucesso',
        };
    },
    onFailure: (error) => {
        return {
        success: false,
        error,
        message: 'Falha ao atualizar exercícios',
        };
    },
    }
);
}

export async function deleteExerciseAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const exerciseId = data.exerciseId;

    if (!exerciseId) {
        throw new Error('ID do exercício é obrigatório');
    }

    console.log('=================================================================');
    console.log('Deleting exercise day with ID:', exerciseId);
    console.log('=================================================================');
    // Delete the exercise day and all associated entities
    const result = await fetchFromApi(`/api/trainers/exercises/${exerciseId}`, {
        method: 'DELETE',
    });

    console.log('Result of exercise deletion:', result);

    if (!result.data || (result.data as any).success === false) {
        console.error('Exercise deletion error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao excluir exercício');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        console.log('Exercise deleted successfully:', data);
        return {
        success: true,
        data,
        message: 'Exercício excluído com sucesso',
        };
    },
    onFailure: (error) => {
        console.error('Exercise deletion failure:', error);
        return {
        success: false,
        error,
        message: 'Falha ao excluir exercício',
        };
    },
    }
);
}