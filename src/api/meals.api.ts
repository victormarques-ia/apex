import { Endpoint, PayloadRequest } from 'payload'

// Interface para histórico de refeições
interface MealHistory {
  [date: string]: {
    meals: Array<{
      id: string;
      mealType: string;
      scheduledTime: string;
      orderIndex: number;
      foods: Array<any>;
      isRepeated: boolean;
      originalDate?: string;
    }>;
  };
}

// Interface para totais nutricionais
interface NutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Interface para totais por tipo de refeição
interface MealTypeTotals {
  [mealType: string]: NutrientTotals;
}

// Interface para totais diários
interface DailyTotals {
  [date: string]: {
    byMealType: MealTypeTotals;
    total: NutrientTotals;
  };
}

export const MealsApi: Endpoint[] = [
  {
    method: 'get',
    path: '/totals',
    handler: async (req: PayloadRequest) => {
      try {
        let { from, to } = req.query;
        const { athleteId, nutritionistId, includeRepeated = 'true' } = req.query;
        
        // Basic validation
        if (!athleteId) {
          return Response.json(
            {
              errors: [{ message: 'ID do atleta é obrigatório' }],
            },
            { status: 400 }
          );
        }

        // Set default date range if not provided
        if (!from) {
          const today = new Date();
          from = today.toISOString().split('T')[0];
        }

        // If to is not provided, use the from date (single day)
        if (!to) {
          to = from;
        }

        console.log('Params for meal totals:', from, to, athleteId, nutritionistId, includeRepeated);

        // Buscar todos os meal-food com profundidade 3 (isso já traz todos os dados relacionados)
        const mealFoodsResponse = await req.payload.find({
          collection: 'meal-food',
          where: {
            and: [
              {
                "meal.diet_plan_day.diet_plan.athlete": {
                  equals: athleteId,
                },
              },
              nutritionistId ? {
                "meal.diet_plan_day.diet_plan.nutritionist": {
                  equals: nutritionistId,
                },
              } : {},
              {
                "meal.diet_plan_day.diet_plan.start_date": {
                  less_than_equal: to as string,
                },
              },
              {
                "meal.diet_plan_day.diet_plan.end_date": {
                  greater_than_equal: from as string,
                },
              }
            ].filter(item => Object.keys(item).length > 0),
          },
          depth: 3,
          limit: 100,
        });

        const mealFoods = mealFoodsResponse.docs;

        // Generate date range for the requested period
        const fromDate = new Date(from as string);
        const toDate = new Date(to as string);
        const dateRange = [];
        
        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
          dateRange.push(d.toISOString().split('T')[0]);
        }

        // Initialize result structures
        const dailyTotals = {};
        const grandTotal = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        };

        // Initialize daily totals structure
        dateRange.forEach(date => {
          dailyTotals[date] = {
            byMealType: {},
            total: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            }
          };
        });

        // Process each meal-food and apply to relevant dates
        mealFoods.forEach(mealFood => {
          const meal = mealFood.meal;
          const food = mealFood.food;
          const quantity = mealFood.quantity_grams;
          
          if (!meal || !food || !meal.diet_plan_day || !meal.diet_plan_day.diet_plan) {
            return; // Skip if missing critical data
          }

          const mealType = meal.meal_type || 'Unknown';
          const dietPlanDay = meal.diet_plan_day;
          const dietPlan = dietPlanDay.diet_plan;
          const dietDayDate = new Date(dietPlanDay.date);
          const repeatInterval = dietPlanDay.repeat_interval_days || 0;
          
          const dietDayDateStr = dietDayDate.toISOString().split('T')[0];
          const planStartDate = new Date(dietPlan.start_date);
          const planEndDate = new Date(dietPlan.end_date);

          // Calculate nutrition values per 100g
          const quantityMultiplier = quantity / 100;
          const calories = (food.calories_per_100g || 0) * quantityMultiplier;
          const protein = (food.protein_per_100g || 0) * quantityMultiplier;
          const carbs = (food.carbs_per_100g || 0) * quantityMultiplier;
          const fat = (food.fat_per_100g || 0) * quantityMultiplier;

          // Add to relevant dates (original and repeats if applicable)
          dateRange.forEach(dateStr => {
            const currentDate = new Date(dateStr);
            
            // Skip if outside plan range
            if (currentDate < planStartDate || currentDate > planEndDate) {
              return;
            }
            
            // Check if original date or a repeated date
            const isOriginalDate = dietDayDateStr === dateStr;
            
            let isRepeatedDate = false;
            if (repeatInterval > 0 && includeRepeated === 'true') {
              const diffTime = Math.abs(currentDate.getTime() - dietDayDate.getTime());
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              isRepeatedDate = diffDays % repeatInterval === 0 && diffDays > 0;
            }
            
            // If this food applies to this date
            if (isOriginalDate || isRepeatedDate) {
              // Initialize meal type totals if needed
              if (!dailyTotals[dateStr].byMealType[mealType]) {
                dailyTotals[dateStr].byMealType[mealType] = {
                  calories: 0,
                  protein: 0,
                  carbs: 0,
                  fat: 0
                };
              }
              
              // Add to meal type totals
              dailyTotals[dateStr].byMealType[mealType].calories += calories;
              dailyTotals[dateStr].byMealType[mealType].protein += protein;
              dailyTotals[dateStr].byMealType[mealType].carbs += carbs;
              dailyTotals[dateStr].byMealType[mealType].fat += fat;
              
              // Add to daily totals
              dailyTotals[dateStr].total.calories += calories;
              dailyTotals[dateStr].total.protein += protein;
              dailyTotals[dateStr].total.carbs += carbs;
              dailyTotals[dateStr].total.fat += fat;
              
              // Add to grand total
              grandTotal.calories += calories;
              grandTotal.protein += protein;
              grandTotal.carbs += carbs;
              grandTotal.fat += fat;
            }
          });
        });

        // Round all values
        Object.keys(dailyTotals).forEach(date => {
          // Round daily totals
          dailyTotals[date].total.calories = Number(dailyTotals[date].total.calories.toFixed(2));
          dailyTotals[date].total.protein = Number(dailyTotals[date].total.protein.toFixed(2));
          dailyTotals[date].total.carbs = Number(dailyTotals[date].total.carbs.toFixed(2));
          dailyTotals[date].total.fat = Number(dailyTotals[date].total.fat.toFixed(2));
          
          // Round meal type totals
          Object.keys(dailyTotals[date].byMealType).forEach(type => {
            dailyTotals[date].byMealType[type].calories = Number(dailyTotals[date].byMealType[type].calories.toFixed(2));
            dailyTotals[date].byMealType[type].protein = Number(dailyTotals[date].byMealType[type].protein.toFixed(2));
            dailyTotals[date].byMealType[type].carbs = Number(dailyTotals[date].byMealType[type].carbs.toFixed(2));
            dailyTotals[date].byMealType[type].fat = Number(dailyTotals[date].byMealType[type].fat.toFixed(2));
          });
        });
    
        // Round grand totals
        grandTotal.calories = Number(grandTotal.calories.toFixed(2));
        grandTotal.protein = Number(grandTotal.protein.toFixed(2));
        grandTotal.carbs = Number(grandTotal.carbs.toFixed(2));
        grandTotal.fat = Number(grandTotal.fat.toFixed(2));
        
        return Response.json({
          dailyTotals,
          grandTotal,
          dateRange,
          message: 'Totais nutricionais calculados com sucesso',
          includeRepeated: includeRepeated === 'true'
        });
        
      } catch (error) {
        console.error('[MealsApi][totals]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao calcular totais de refeições' }],
          },
          { status: 500 }
        );
      }
    },
  },
  {
    method: 'get',
    path: '/history',
    handler: async (req: PayloadRequest) => {
      try {
        let { from, to } = req.query;
        const { athleteId, nutritionistId, includeRepeated = 'true' } = req.query;
        
        // Basic validation
        if (!athleteId) {
          return Response.json(
            {
              errors: [{ message: 'ID do atleta é obrigatório' }],
            },
            { status: 400 }
          );
        }

        // Set default date range if not provided
        if (!from) {
          const today = new Date();
          from = today.toISOString().split('T')[0];
        }

        // If to is not provided, use the from date (single day)
        if (!to) {
          to = from;
        }

        console.log('Params for meal history:', from, to, athleteId, nutritionistId, includeRepeated);

        // Buscar todos os meal-food com profundidade 3 (isso já traz todos os dados relacionados)
        const mealFoods = await req.payload.find({
          collection: 'meal-food',
          where: {
            and: [
              {
                "meal.diet_plan_day.diet_plan.athlete": {
                  equals: athleteId,
                },
              },
              nutritionistId ? {
                "meal.diet_plan_day.diet_plan.nutritionist": {
                  equals: nutritionistId,
                },
              } : {},
              {
                "meal.diet_plan_day.diet_plan.start_date": {
                  less_than_equal: to as string,
                },
              },
              {
                "meal.diet_plan_day.diet_plan.end_date": {
                  greater_than_equal: from as string,
                },
              }
            ].filter(item => Object.keys(item).length > 0),
          },
          depth: 3,
          limit: 100,
        });

        // Organizar os meal-foods por meal para processamento
        const mealMap = new Map();
        
        mealFoods.docs.forEach(mealFood => {
          const mealId = mealFood.meal.id;
          
          if (!mealMap.has(mealId)) {
            mealMap.set(mealId, {
              id: mealId,
              type: mealFood.meal.meal_type,
              scheduledTime: mealFood.meal.scheduled_time,
              orderIndex: mealFood.meal.order_index || 0,
              dietPlanDay: mealFood.meal.diet_plan_day,
              foods: []
            });
          }
          
          mealMap.get(mealId).foods.push({
            id: mealFood.id,
            food: mealFood.food,
            quantity: mealFood.quantity_grams
          });
        });

        // Gerar intervalo de datas para o período solicitado
        const fromDate = new Date(from as string);
        const toDate = new Date(to as string);
        const dateRange = [];
        
        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
          dateRange.push(d.toISOString().split('T')[0]);
        }

        // Gerar o histórico considerando as repetições
        const history: MealHistory = {};
        
        dateRange.forEach(date => {
          history[date] = { meals: [] };
          const currentDate = new Date(date);
          
          // Para cada meal, verificar se ela se aplica a esta data
          mealMap.forEach(meal => {
            const dietPlanDay = meal.dietPlanDay;
            const dietPlan = dietPlanDay.diet_plan;
            const dietDayDate = new Date(dietPlanDay.date);
            const repeatInterval = dietPlanDay.repeat_interval_days || 0;
            
            // Verificar se a data está dentro do período do plano
            const planStartDate = new Date(dietPlan.start_date);
            const planEndDate = new Date(dietPlan.end_date);
            
            if (currentDate < planStartDate || currentDate > planEndDate) {
              return; // Pular se fora do período do plano
            }
            
            // Verificar se é o dia original
            const isOriginalDay = dietDayDate.toISOString().split('T')[0] === date;
            
            // Verificar se é um dia repetido
            let isRepeatedDay = false;
            if (repeatInterval > 0 && includeRepeated === 'true') {
              // Calcular diferença de dias
              const diffTime = Math.abs(currentDate.getTime() - dietDayDate.getTime());
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              
              // Verificar se a diferença é múltiplo do intervalo de repetição
              isRepeatedDay = diffDays % repeatInterval === 0 && diffDays > 0;
            }
            
            // Adicionar meal ao histórico se for o dia original ou um dia repetido
            if (isOriginalDay || isRepeatedDay) {
              history[date].meals.push({
                id: meal.id,
                mealType: meal.type,
                scheduledTime: meal.scheduledTime,
                orderIndex: meal.orderIndex,
                foods: meal.foods,
                isRepeated: isRepeatedDay,
                originalDate: isRepeatedDay ? dietDayDate.toISOString().split('T')[0] : undefined
              });
            }
          });
          
          // Ordenar meals por orderIndex
          history[date].meals.sort((a, b) => a.orderIndex - b.orderIndex);
        });

        // Retornar o histórico completo
        const mealsHistory = {
          history,
          dateRange,
          message: Object.values(history).some(day => day.meals.length > 0) 
            ? 'Histórico de refeições gerado com sucesso' 
            : 'Nenhuma refeição encontrada para o período',
          includeRepeated: includeRepeated === 'true'
        };
        
        return Response.json({
          ...mealsHistory,
        });
        
      } catch (error) {
        console.error('[MealsApi][history]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao obter histórico de refeições' }],
          },
          { status: 500 }
        );
      }
    },
  },
];
