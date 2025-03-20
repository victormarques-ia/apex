'use server'

import { di } from '@/app/di'

export async function addConsumptionAction(
  athleteId: string,
  foodId: string,
  date: string,
  quantity: number,
) {
  try {
    const result = await di.dailyConsumptionService.addFoodConsumption(
      athleteId,
      foodId,
      date,
      quantity,
    )

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('[addConsumptionAction]', error)
    return {
      success: false,
      error: 'Falha ao adicionar o consumo',
    }
  }
}

export async function updateConsumptionAction(consumptionId: string, quantity: number) {
  try {
    const result = await di.dailyConsumptionService.updateFoodConsumption(consumptionId, quantity)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('[updateConsumptionAction]', error)
    return {
      success: false,
      error: 'Falha ao atualizar o consumo',
    }
  }
}

export async function deleteConsumptionAction(consumptionId: string) {
  try {
    await di.dailyConsumptionService.deleteFoodConsumption(consumptionId)

    return {
      success: true,
    }
  } catch (error) {
    console.error('[deleteConsumptionAction]', error)
    return {
      success: false,
      error: 'Falha ao remover o consumo',
    }
  }
}