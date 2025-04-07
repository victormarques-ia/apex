'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

// Action to search for all exercises (no filters)
export async function getAllExercisesAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async () => {
      console.log('Getting all exercises')

      // Fetch all exercises with no filters
      const result = await fetchFromApi('/api/trainers/exercises', {
        method: 'GET',
      })

      // If no data was returned but no error either, return an empty array
      if (!result.data && !result.error) {
        return { docs: [] }
      }

      if (!result.data) {
        console.error('Exercise fetch API error:', result.error)
        throw new Error(result.error?.messages[0] || 'Erro ao buscar exercícios')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        console.log('All exercises success, count:', data.docs?.length || 0)
        return {
          success: true,
          data,
        }
      },
      onFailure: (error) => {
        console.error('Exercise fetch failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao buscar exercícios',
        }
      },
    },
  )
}

// Action to search for exercises
export async function searchExercisesAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const name = data.name || ''
      const muscleGroup = data.muscleGroup || ''

      console.log('Search exercise parameters:', { name, muscleGroup })

      // Build the query parameters
      const queryParams = new URLSearchParams()

      // Only add parameters if they have values
      if (name) queryParams.append('name', name as string)
      if (muscleGroup) queryParams.append('muscleGroup', muscleGroup as string)

      // If no search parameters, just get all exercises
      const endpoint = queryParams.toString()
        ? `/api/trainers/exercises?${queryParams.toString()}`
        : '/api/trainers/exercises'

      console.log('Searching exercises with endpoint:', endpoint)

      // Search for exercises
      const result = await fetchFromApi(endpoint, {
        method: 'GET',
      })

      console.log('Exercise API response:', result)

      // If no data was returned but no error either, return an empty array
      if (!result.data && !result.error) {
        return { docs: [] }
      }

      if (!result.data) {
        console.error('Exercise search API error:', result.error)
        throw new Error(result.error?.messages[0] || 'Erro ao pesquisar exercícios')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        console.log('Exercise search success:', data)
        return {
          success: true,
          data,
        }
      },
      onFailure: (error) => {
        console.error('Exercise search failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao pesquisar exercícios',
        }
      },
    },
  )
}

// Action to add a new exercise
export async function addExerciseAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // Make sure we have the required field
      if (!data.name) {
        throw new Error('Nome do exercício é obrigatório')
      }

      const exerciseData = {
        name: data.name,
        description: data.description || '',
        muscleGroup: data.muscleGroup || '',
      }

      console.log('Adding exercise:', exerciseData)

      const result = await fetchFromApi('/api/trainers/exercises', {
        method: 'POST',
        body: JSON.stringify(exerciseData),
      })

      console.log('Add exercise response:', result)

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao adicionar exercício')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Exercício adicionado com sucesso',
        }
      },
      onFailure: (error) => {
        return {
          success: false,
          error,
          message: 'Falha ao adicionar exercício',
        }
      },
    },
  )
}

// Action to update exercises
export async function updateExercisesAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const exerciseId = data.exerciseId

      if (!exerciseId) {
        throw new Error('ID do exercício é obrigatório')
      }

      const exerciseData = {
        name: data.name,
        description: data.description || '',
        muscleGroup: data.muscleGroup || '',
      }

      console.log('Updating exercise:', exerciseId, exerciseData)

      // Fetch the exercises list
      const result = await fetchFromApi(`/api/trainers/exercises/${exerciseId}`, {
        method: 'PUT',
        body: JSON.stringify(exerciseData),
      })

      console.log('Update exercise response:', result)

      if (!result.data || (result.data as any).success === false) {
        throw new Error(result.error?.messages[0] || 'Erro ao atualizar exercícios')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Exercício atualizado com sucesso',
        }
      },
      onFailure: (error) => {
        return {
          success: false,
          error,
          message: 'Falha ao atualizar exercícios',
        }
      },
    },
  )
}

export async function deleteExerciseAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const exerciseId = data.exerciseId

      if (!exerciseId) {
        throw new Error('ID do exercício é obrigatório')
      }

      console.log('Deleting exercise with ID:', exerciseId)

      // Delete the exercise
      const result = await fetchFromApi(`/api/trainers/exercises/${exerciseId}`, {
        method: 'DELETE',
      })

      console.log('Result of exercise deletion:', result)

      if (!result.data || (result.data as any).success === false) {
        console.error('Exercise deletion error:', result.error)
        throw new Error(result.error?.messages[0] || 'Erro ao excluir exercício')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        console.log('Exercise deleted successfully:', data)
        return {
          success: true,
          data,
          message: 'Exercício excluído com sucesso',
        }
      },
      onFailure: (error) => {
        console.error('Exercise deletion failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao excluir exercício',
        }
      },
    },
  )
}
