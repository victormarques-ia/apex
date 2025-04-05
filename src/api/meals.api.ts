import { Endpoint, PayloadRequest } from 'payload'

// Interface para histórico de refeições
interface MealHistory {
  [date: string]: {
    meals: Array<{
      id: string
      mealType: string
      scheduledTime: string
      orderIndex: number
      foods: Array<any>
      isRepeated: boolean
      originalDate?: string
    }>
  }
}

// Interface para totais nutricionais
interface NutrientTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Interface para totais por tipo de refeição
interface MealTypeTotals {
  [mealType: string]: NutrientTotals
}

// Interface para totais diários
interface DailyTotals {
  [date: string]: {
    byMealType: MealTypeTotals
    total: NutrientTotals
  }
}

export const MealsApi: Endpoint[] = [
  {
    method: 'get',
    path: '/totals',
    handler: async (req: PayloadRequest) => {
      try {
        const { from, to } = req.query
        const {
          athleteId,
          nutritionistId,
          dietPlanId,
          dietPlanDayId,
          includeRepeated = 'true',
        } = req.query

        // Basic validation
        if (!athleteId) {
          return Response.json(
            {
              errors: [{ message: 'ID do atleta é obrigatório' }],
            },
            { status: 400 },
          )
        }

        // Fetch meals first, similar to history endpoint
        const meals = await req.payload.find({
          collection: 'meal',
          where: {
            and: [
              {
                'diet_plan_day.diet_plan.athlete': {
                  equals: athleteId,
                },
              },
              nutritionistId
                ? {
                    'diet_plan_day.diet_plan.nutritionist': {
                      equals: nutritionistId,
                    },
                  }
                : {},
              dietPlanDayId
                ? {
                    'diet_plan_day.id': {
                      equals: dietPlanDayId,
                    },
                  }
                : {},
              dietPlanId
                ? {
                    'diet_plan_day.diet_plan.id': {
                      equals: dietPlanId,
                    },
                  }
                : {},
            ],
          },
          depth: 3,
          limit: 100,
        })

        // Fetch meal-foods to calculate nutrition data
        const mealFoods = await req.payload.find({
          collection: 'meal-food',
          where: {
            and: [
              {
                'meal.diet_plan_day.diet_plan.athlete': {
                  equals: athleteId,
                },
              },
              nutritionistId
                ? {
                    'meal.diet_plan_day.diet_plan.nutritionist': {
                      equals: nutritionistId,
                    },
                  }
                : {},
              dietPlanDayId
                ? {
                    'meal.diet_plan_day.id': {
                      equals: dietPlanDayId,
                    },
                  }
                : {},
              dietPlanId
                ? {
                    'meal.diet_plan_day.diet_plan.id': {
                      equals: dietPlanId,
                    },
                  }
                : {},
            ],
          },
          depth: 3,
          limit: 100,
        })

        // Determine date range based on meal plan dates
        let fromDietPlanDates = new Date('9999-01-01')
        let toDietPlanDates = new Date('0001-01-01')

        meals.docs.forEach((meal) => {
          const dietPlanDay = typeof meal.diet_plan_day === 'object' ? meal.diet_plan_day : null
          const dietPlan = dietPlanDay?.diet_plan

          const startDate =
            typeof dietPlan === 'object' && dietPlan.start_date
              ? new Date(dietPlan.start_date)
              : new Date('2025-04-04')
          const endDate =
            typeof dietPlan === 'object' && dietPlan.end_date
              ? new Date(dietPlan.end_date)
              : new Date('2025-04-05')

          if (startDate < fromDietPlanDates) {
            fromDietPlanDates = startDate
          }

          if (endDate > toDietPlanDates) {
            toDietPlanDates = endDate
          }
        })
        const fromQueryDate = new Date(from as string)
        const toQueryDate = new Date(to as string)
        const fromDate =
          fromQueryDate && fromQueryDate > fromDietPlanDates ? fromQueryDate : fromDietPlanDates
        const toDate = toQueryDate && toQueryDate < toDietPlanDates ? toQueryDate : toDietPlanDates

        const dateRange: string[] = []

        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
          dateRange.push(d.toISOString().split('T')[0])
        }

        // Initialize result structures
        const dailyTotals: DailyTotals = {}
        const grandTotal = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        }

        // Initialize daily totals structure
        dateRange.forEach((date) => {
          dailyTotals[date] = {
            byMealType: {},
            total: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            },
          }
        })

        // Organize meals by date first, similar to history endpoint
        const organizedMeals: { [date: string]: any[] } = {}

        // Initialize date ranges in organizedMeals
        dateRange.forEach((date) => {
          organizedMeals[date] = []
        })

        // Group meals by date like in history endpoint
        meals.docs.forEach((meal) => {
          const dietPlanDay = meal.diet_plan_day
          const dietPlan = typeof dietPlanDay === 'object' ? dietPlanDay.diet_plan : undefined
          const planStartDate =
            typeof dietPlan === 'object' && dietPlan.start_date
              ? new Date(dietPlan.start_date)
              : new Date('2025-04-04')
          const planEndDate =
            typeof dietPlan === 'object' && dietPlan.end_date
              ? new Date(dietPlan.end_date)
              : new Date('2025-05-05')
          const dietDayDate =
            typeof dietPlanDay === 'object' && 'date' in dietPlanDay
              ? new Date(dietPlanDay.date)
              : null

          // Add meal to each applicable date in range
          dateRange.forEach((dateStr) => {
            const currentDate = new Date(dateStr)

            // Skip if outside plan range
            if (currentDate < planStartDate || currentDate > planEndDate) {
              return
            }

            if (
              dietDayDate &&
              currentDate.toISOString().split('T')[0] !== dietDayDate.toISOString().split('T')[0]
            ) {
              return // Pular se a data não é o dia do plano
            }

            // If meal applies to this date, add it
            organizedMeals[dateStr].push(meal)
          })
        })

        // Now process each meal-food for nutritional calculation
        Object.keys(organizedMeals).forEach((dateStr) => {
          const mealsForDate = organizedMeals[dateStr]

          mealsForDate.forEach((meal) => {
            // Find related meal-foods
            const relatedMealFoods = mealFoods.docs.filter(
              (mf) => typeof mf.meal === 'object' && mf.meal.id === meal.id,
            )

            relatedMealFoods.forEach((mealFood) => {
              const food = mealFood.food
              const quantity = mealFood.quantity_grams
              const mealType = meal.meal_type || 'Unknown'

              if (typeof food !== 'object' || food === null) {
                return // Skip if missing food data
              }

              // Calculate nutrition values per 100g
              const quantityMultiplier = quantity / 100
              const calories = (food.calories_per_100g || 0) * quantityMultiplier
              const protein = (food.protein_per_100g || 0) * quantityMultiplier
              const carbs = (food.carbs_per_100g || 0) * quantityMultiplier
              const fat = (food.fat_per_100g || 0) * quantityMultiplier

              // Initialize meal type totals if needed
              if (!dailyTotals[dateStr].byMealType[mealType]) {
                dailyTotals[dateStr].byMealType[mealType] = {
                  calories: 0,
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                }
              }

              // Add to meal type totals
              dailyTotals[dateStr].byMealType[mealType].calories += calories
              dailyTotals[dateStr].byMealType[mealType].protein += protein
              dailyTotals[dateStr].byMealType[mealType].carbs += carbs
              dailyTotals[dateStr].byMealType[mealType].fat += fat

              // Add to daily totals
              dailyTotals[dateStr].total.calories += calories
              dailyTotals[dateStr].total.protein += protein
              dailyTotals[dateStr].total.carbs += carbs
              dailyTotals[dateStr].total.fat += fat

              // Add to grand total
              grandTotal.calories += calories
              grandTotal.protein += protein
              grandTotal.carbs += carbs
              grandTotal.fat += fat
            })
          })
        })

        // Round all values
        Object.keys(dailyTotals).forEach((date) => {
          // Round daily totals
          dailyTotals[date].total.calories = Number(dailyTotals[date].total.calories.toFixed(2))
          dailyTotals[date].total.protein = Number(dailyTotals[date].total.protein.toFixed(2))
          dailyTotals[date].total.carbs = Number(dailyTotals[date].total.carbs.toFixed(2))
          dailyTotals[date].total.fat = Number(dailyTotals[date].total.fat.toFixed(2))

          // Round meal type totals
          Object.keys(dailyTotals[date].byMealType).forEach((type) => {
            dailyTotals[date].byMealType[type].calories = Number(
              dailyTotals[date].byMealType[type].calories.toFixed(2),
            )
            dailyTotals[date].byMealType[type].protein = Number(
              dailyTotals[date].byMealType[type].protein.toFixed(2),
            )
            dailyTotals[date].byMealType[type].carbs = Number(
              dailyTotals[date].byMealType[type].carbs.toFixed(2),
            )
            dailyTotals[date].byMealType[type].fat = Number(
              dailyTotals[date].byMealType[type].fat.toFixed(2),
            )
          })
        })

        // Round grand totals
        grandTotal.calories = Number(grandTotal.calories.toFixed(2))
        grandTotal.protein = Number(grandTotal.protein.toFixed(2))
        grandTotal.carbs = Number(grandTotal.carbs.toFixed(2))
        grandTotal.fat = Number(grandTotal.fat.toFixed(2))

        return Response.json({
          dailyTotals,
          grandTotal,
          dateRange,
          message: 'Totais nutricionais calculados com sucesso',
        })
      } catch (error) {
        console.error('[MealsApi][totals]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao calcular totais de refeições' }],
          },
          { status: 500 },
        )
      }
    },
  },
  {
    method: 'get',
    path: '/history',
    handler: async (req: PayloadRequest) => {
      try {
        const { from, to } = req.query
        const {
          athleteId,
          nutritionistId,
          dietPlanId,
          dietPlanDayId,
          includeRepeated = 'true',
        } = req.query

        // Basic validation
        if (!athleteId) {
          return Response.json(
            {
              errors: [{ message: 'ID do atleta é obrigatório' }],
            },
            { status: 400 },
          )
        }

        const meals = await req.payload.find({
          collection: 'meal',
          where: {
            and: [
              {
                'diet_plan_day.diet_plan.athlete': {
                  equals: athleteId,
                },
              },
              nutritionistId
                ? {
                    'diet_plan_day.diet_plan.nutritionist': {
                      equals: nutritionistId,
                    },
                  }
                : {},
              // Acho que vou tirar isso aqui kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
              dietPlanDayId
                ? {
                    'diet_plan_day.id': {
                      equals: dietPlanDayId,
                    },
                  }
                : {},
              dietPlanId
                ? {
                    'diet_plan_day.diet_plan.id': {
                      equals: dietPlanId,
                    },
                  }
                : {},
            ],
          },
          depth: 3,
          limit: 100,
        })

        // Buscar todos os meal-food com profundidade 3 (isso já traz todos os dados relacionados)
        const mealWithFoods = await req.payload.find({
          collection: 'meal-food',
          where: {
            and: [
              {
                'meal.diet_plan_day.diet_plan.athlete': {
                  equals: athleteId,
                },
              },
              nutritionistId
                ? {
                    'meal.diet_plan_day.diet_plan.nutritionist': {
                      equals: nutritionistId,
                    },
                  }
                : {},
              dietPlanDayId
                ? {
                    'meal.diet_plan_day.id': {
                      equals: dietPlanDayId,
                    },
                  }
                : {},
              dietPlanId
                ? {
                    'meal.diet_plan_day.diet_plan.id': {
                      equals: dietPlanId,
                    },
                  }
                : {},
            ],
          },
          depth: 3,
          limit: 100,
        })

        // Organizar os meal-foods por meal para processamento
        type MealMapItem = {
          id: number
          type?: string
          scheduledTime?: string
          orderIndex: number
          dietPlanDay: any
          mealFoods: Array<{
            id: number
            food: any // aqui usamos 'any' para evitar o erro de tipo
            quantity_grams: number
          }>
        }

        const mealMap: MealMapItem[] = []

        meals.docs.forEach((meal) => {
          const mealId = meal.id

          const mealFoods = mealWithFoods.docs.filter(
            (mealFood) => typeof mealFood.meal === 'object' && mealFood.meal.id === mealId,
          )

          mealMap.push({
            id: mealId,
            type: meal.meal_type,
            scheduledTime: meal.scheduled_time ?? undefined,
            orderIndex: meal.order_index || 0,
            dietPlanDay: meal.diet_plan_day,
            mealFoods: mealFoods.map((mealFood) => {
              return {
                id: mealFood.id,
                food: mealFood.food,
                quantity_grams: mealFood.quantity_grams,
              }
            }),
          })
        })

        const history: MealHistory = {}
        const dietPlanDates: Date[] = []
        let fromDietPlanDates = new Date('9999-01-01')
        let toDietPlanDates = new Date('0001-01-01')

        // Gerar intervalo de datas para o período solicitado
        // Pega a primeira data de todos os dias de planos alimentares
        // e a última data de todos os dias de planos alimentares

        mealMap.forEach((meal) => {
          const dietPlan = meal.dietPlanDay.diet_plan

          const startDate = new Date(dietPlan.start_date)
          const endDate = new Date(dietPlan.end_date)

          if (startDate < fromDietPlanDates) {
            fromDietPlanDates = startDate
          }

          if (endDate > toDietPlanDates) {
            toDietPlanDates = endDate
          }
        })

        const fromQueryDate = new Date(from as string)
        const toQueryDate = new Date(to as string)
        const fromDate =
          fromQueryDate && fromQueryDate > fromDietPlanDates ? fromQueryDate : fromDietPlanDates
        const toDate = toQueryDate && toQueryDate < toDietPlanDates ? toQueryDate : toDietPlanDates

        const dateRange = []

        for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
          dateRange.push(d.toISOString().split('T')[0])
        }

        // Gerar o histórico considerando as repetições

        dateRange.forEach((date) => {
          history[date] = { meals: [] }
          const currentDate = new Date(date)

          // Para cada meal, verificar se ela se aplica a esta data
          mealMap.forEach((meal) => {
            const dietPlanDay = meal.dietPlanDay
            const dietPlan = dietPlanDay.diet_plan
            const dietDayDate = new Date(dietPlanDay.date)

            // Verificar se a data está dentro do período do plano
            const planStartDate = new Date(dietPlan.start_date)
            const planEndDate = new Date(dietPlan.end_date)

            if (currentDate < planStartDate || currentDate > planEndDate) {
              return // Pular se fora do período do plano
            }

            if (
              dietDayDate.toISOString().split('T')[0] !== currentDate.toISOString().split('T')[0]
            ) {
              return // Pular se a data não é o dia do plano
            }

            // Adicionar meal ao histórico se for o dia original ou um dia repetido
            history[date].meals.push({
              id: meal.id,
              diet_plan_day: meal.dietPlanDay,
              meal_type: meal.type,
              scheduled_time: meal.scheduledTime,
              order_index: meal.orderIndex,
              foods: meal.mealFoods,
            })
          })

          // Ordenar meals por orderIndex
          history[date].meals.sort((a, b) => a.orderIndex - b.orderIndex)
        })

        // Retornar o histórico completo
        const mealsHistory = {
          history,
          dateRange,
          message: Object.values(history).some((day) => day.meals.length > 0)
            ? 'Histórico de refeições gerado com sucesso'
            : 'Nenhuma refeição encontrada para o período',
        }

        return Response.json({
          ...mealsHistory,
        })
      } catch (error) {
        console.error('[MealsApi][history]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao obter histórico de refeições' }],
          },
          { status: 500 },
        )
      }
    },
  },
  {
    method: 'delete',
    path: '/:mealId',
    handler: async (req: PayloadRequest) => {
      try {
        const mealId = req.routeParams?.mealId

        // Delete the meal-food
        await req.payload.delete({
          collection: 'meal-food',
          where: {
            meal: {
              equals: mealId,
            },
          },
        })

        await req.payload.delete({
          collection: 'meal',
          where: {
            id: {
              equals: mealId,
            },
          },
        })

        return Response.json({
          success: true,
          message: 'Refeição excluída com sucesso',
        })
      } catch (error) {
        console.error('[MealsApi][delete-meal]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao excluir refeição' }],
          },
          { status: 500 },
        )
      }
    },
  },
]
