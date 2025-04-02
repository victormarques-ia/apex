'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'

/**
 * Action to create a meal for a specific diet plan day
 */
export async function createMealAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const dietPlanDayId = data.dietPlanDayId
      const mealType = data.mealType
      const scheduledTime = data.scheduledTime
      const orderIndex = data.orderIndex

      if (!dietPlanDayId) {
        throw new Error('ID do dia do plano alimentar é obrigatório')
      }

      if (!mealType) {
        throw new Error('Tipo de refeição é obrigatório')
      }

      console.log('dietPlanDayId: ', dietPlanDayId);

      // Build the meal data
      const mealData = {
        diet_plan_day: parseInt(dietPlanDayId as string, 10),
        meal_type: mealType,
        scheduled_time: scheduledTime || new Date().toISOString(),
        order_index: orderIndex || 1,
      }

      console.log('mealData: ', mealData);

      // Create the meal
      const result = await fetchFromApi('/api/meal', {
        method: 'POST',
        body: JSON.stringify(mealData),
      })

      if (!result.data) {
        console.error('Meal creation API error:', result.error)
        throw new Error(result.error?.messages[0] || 'Erro ao criar refeição')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Refeição criada com sucesso',
        }
      },
      onFailure: (error) => {
        console.error('Meal creation failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao criar refeição',
        }
      },
    },
  )
}

/**
 * Action to add food to a meal
 */
export async function addFoodToMealAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const mealId = data.mealId
      const foodId = data.foodId
      const quantity = data.quantity

      if (!mealId) {
        throw new Error('ID da refeição é obrigatório')
      }

      if (!foodId) {
        throw new Error('ID do alimento é obrigatório')
      }

      if (!quantity) {
        throw new Error('Quantidade é obrigatória')
      }

      // Build the meal food data
      const mealFoodData = {
        meal: mealId,
        food: foodId,
        quantity: parseInt(quantity as string),
      }

      // Create the meal food
      const result = await fetchFromApi('/api/meal-food', {
        method: 'POST',
        body: JSON.stringify(mealFoodData),
      })

      if (!result.data) {
        console.error('Meal food API error:', result.error)
        throw new Error(result.error?.messages[0] || 'Erro ao adicionar alimento à refeição')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Alimento adicionado à refeição com sucesso',
        }
      },
      onFailure: (error) => {
        console.error('Meal food add failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao adicionar alimento à refeição',
        }
      },
    },
  )
}

/**
 * Action to remove food from a meal
 */
export async function removeFoodFromMealAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const mealFoodId = data.mealFoodId

      if (!mealFoodId) {
        throw new Error('ID do item de refeição é obrigatório')
      }

      // Delete the meal food
      const result = await fetchFromApi(`/api/meal-food/${mealFoodId}`, {
        method: 'DELETE',
      })

      if (!result.data) {
        console.error('Meal food delete API error:', result.error)
        throw new Error(result.error?.messages[0] || 'Erro ao remover alimento da refeição')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Alimento removido da refeição com sucesso',
        }
      },
      onFailure: (error) => {
        console.error('Meal food remove failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao remover alimento da refeição',
        }
      },
    },
  )
}

/**
 * Action to delete a meal
 */
export async function deleteMealAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const mealId = data.mealId

      if (!mealId) {
        throw new Error('ID da refeição é obrigatório')
      }

      // Delete the meal
      const result = await fetchFromApi(`/api/meal/${mealId}`, {
        method: 'DELETE',
      })

      if (!result.data) {
        console.error('Meal delete API error:', result.error)
        throw new Error(result.error?.messages[0] || 'Erro ao excluir refeição')
      }

      return result.data
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Refeição excluída com sucesso',
        }
      },
      onFailure: (error) => {
        console.error('Meal delete failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao excluir refeição',
        }
      },
    },
  )
}
