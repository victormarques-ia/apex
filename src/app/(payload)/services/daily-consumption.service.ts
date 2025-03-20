import BaseService from './base.service'
import { DailyConsumption, Food } from 'payload'

class DailyConsumptionService extends BaseService {
  async getDailyConsumption(athleteId: string, date: string) {
    try {
      const numericAthleteId = parseInt(athleteId, 10);
      
      const result = await this.payload.find({
        collection: 'daily-consumption',
        where: {
          and: [
            {
              athlete: {
                equals: numericAthleteId,
              },
            },
            {
              date: {
                equals: date,
              },
            },
          ],
        },
        depth: 2, // Load related food data
        req: await this.req(),
      });
      
      return result;
    } catch (error) {
      console.error(`[DailyConsumptionService][getDailyConsumption]: `, error);
      return null;
    }
  }

  async addFoodConsumption(athleteId: string, foodId: string, date: string, quantityGrams: number) {
    try {
      console.log('DailyConsumptionService.addFoodConsumption called with:', {
        athleteId, foodId, date, quantityGrams
      });
      
      // Converter IDs para números
      const numericAthleteId = parseInt(athleteId, 10);
      const numericFoodId = parseInt(foodId, 10);
      
      if (isNaN(numericAthleteId) || isNaN(numericFoodId)) {
        throw new Error('IDs inválidos: athleteId ou foodId não são números válidos');
      }
      
      // Criar o consumo diário com IDs numéricos
      const result = await this.create({
        collection: 'daily-consumption',
        data: {
          athlete: numericAthleteId,
          food: numericFoodId,
          date,
          quantity_grams: quantityGrams,
        },
      });
      
      return result;
    } catch (error) {
      console.error(`[DailyConsumptionService][addFoodConsumption]: `, error);
      return null;
    }
  }

  async updateFoodConsumption(consumptionId: string, quantityGrams: number) {
    try {
      const numericConsumptionId = parseInt(consumptionId, 10);
      
      const result = await this.payload.update({
        collection: 'daily-consumption',
        id: numericConsumptionId,
        data: {
          quantity_grams: quantityGrams,
        },
        req: await this.req(),
      });

      return result;
    } catch (error) {
      console.error(`[DailyConsumptionService][updateFoodConsumption]: `, error);
      return null;
    }
  }

  async deleteFoodConsumption(consumptionId: string) {
    try {
      const numericConsumptionId = parseInt(consumptionId, 10);
      
      const result = await this.payload.delete({
        collection: 'daily-consumption',
        id: numericConsumptionId,
        req: await this.req(),
      });

      return result;
    } catch (error) {
      console.error(`[DailyConsumptionService][deleteFoodConsumption]: `, error);
      return null;
    }
  }

  async getFoods(search?: string) {
    try {
      const query: any = {
        collection: 'food',
        req: await this.req(),
      };

      if (search) {
        query.where = {
          name: {
            like: search,
          },
        };
      }

      const result = await this.payload.find(query);

      return result;
    } catch (error) {
      console.error(`[DailyConsumptionService][getFoods]: `, error);
      return null;
    }
  }

  async calculateNutrition(consumptions: DailyConsumption[]) {
    try {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      for (const consumption of consumptions) {
        const food = consumption.food as Food;
        const grams = consumption.quantity_grams;

        if (food) {
          totalCalories += ((food.calories_per_100g || 0) * grams) / 100;
          totalProtein += ((food.protein_per_100g || 0) * grams) / 100;
          totalCarbs += ((food.carbs_per_100g || 0) * grams) / 100;
          totalFat += ((food.fat_per_100g || 0) * grams) / 100;
        }
      }

      return {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
      };
    } catch (error) {
      console.error(`[DailyConsumptionService][calculateNutrition]: `, error);
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }
  }
}

export default DailyConsumptionService
