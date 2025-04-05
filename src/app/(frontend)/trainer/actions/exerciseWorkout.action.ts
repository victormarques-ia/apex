'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to search for exerciseWorkouts
export async function searchExerciseWorkoutsAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const exerciseId = data.exerciseId;
    const workoutPlanId = data.workoutPlanId;
    
    // Build the query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('exerciseId', exerciseId as string);
    queryParams.append('workoutPlanId', workoutPlanId as string);

    const endpoint = `/api/trainers/exercise-workouts?${queryParams.toString()}`;

    // Search for exerciseWorkouts
    const result = await fetchFromApi(endpoint, {
        method: 'GET',
    });

    if (!result.data) {
        console.error('ExerciseWorkout search API error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao pesquisar exercícios de treinos');
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
        console.error('ExerciseWorkout search failure:', error);
        return {
        success: false,
        error,
        message: 'Falha ao pesquisar exercícios de treino',
        };
    },
    }
);
}
  
// Action to add a new exerciseWorkout
export async function addExerciseWorkoutAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {

    const exerciseWorkoutData = {
        workoutPlanId: data.workoutPlanId,
        exerciseId: data.exerciseId,
        sets: data.sets,
        reps: data.reps,
        rest_seconds: data.rest_seconds,
        notes: data.notes,
    }

    const result = await fetchFromApi('/api/trainers/exercise-workouts', {
        method: 'POST',
        body: JSON.stringify(exerciseWorkoutData),
    });

    if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao adicionar exercícios de treino');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        return {
        success: true,
        data,
        message: 'Exercícios de treino adicionado com sucesso',
        };
    },
    onFailure: (error) => {
        return {
        success: false,
        error,
        message: 'Falha ao adicionar exercícios de treino',
        };
    },
    }
);
}
  
// Action to list exerciseWorkouts with pagination
export async function updateExerciseWorkoutsAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const exerciseWorkoutId = data.exerciseWorkoutId;

    if (!exerciseWorkoutId) {
        throw new Error('ID do exercícios de treino é obrigatório');
    }

    const exerciseWorkoutData = {
        workoutPlanId: data.workoutPlanId,
        exerciseId: data.exerciseId,
        sets: data.sets,
        reps: data.reps,
        rest_seconds: data.rest_seconds,
        notes: data.notes,
    }

    // Fetch the exerciseWorkouts list
    const result = await fetchFromApi(`/api/trainers/exercise-workouts/${exerciseWorkoutId}`, {
        method: 'PUT',
        body: JSON.stringify(exerciseWorkoutData),
    });

    if (!result.data || (result.data as any).success === false) {
        throw new Error(result.error?.messages[0] || 'Erro ao atualizar exercícios de treinos');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        return {
        success: true,
        data,
        message: 'Exercícios de treino atualizado com sucesso',
        };
    },
    onFailure: (error) => {
        return {
        success: false,
        error,
        message: 'Falha ao atualizar exercícios de treinos',
        };
    },
    }
);
}

export async function deleteExerciseWorkoutAction(_state: unknown, formData: FormData) {
return actionHandlerWithValidation(
    formData,
    async (data) => {
    const exerciseWorkoutId = data.exerciseWorkoutId;

    if (!exerciseWorkoutId) {
        throw new Error('ID do exercícios de treino é obrigatório');
    }

    console.log('=================================================================');
    console.log('Deleting exerciseWorkout day with ID:', exerciseWorkoutId);
    console.log('=================================================================');
    // Delete the exerciseWorkout day and all associated entities
    const result = await fetchFromApi(`/api/trainers/exercise-workouts/${exerciseWorkoutId}`, {
        method: 'DELETE',
    });

    console.log('Result of exerciseWorkout deletion:', result);

    if (!result.data || (result.data as any).success === false) {
        console.error('ExerciseWorkout deletion error:', result.error);
        throw new Error(result.error?.messages[0] || 'Erro ao excluir exercícios de treino');
    }

    return result.data;
    },
    {
    onSuccess: (data) => {
        console.log('ExerciseWorkout deleted successfully:', data);
        return {
        success: true,
        data,
        message: 'Exercícios de treino excluído com sucesso',
        };
    },
    onFailure: (error) => {
        console.error('ExerciseWorkout deletion failure:', error);
        return {
        success: false,
        error,
        message: 'Falha ao excluir exercícios de treino',
        };
    },
    }
);
}