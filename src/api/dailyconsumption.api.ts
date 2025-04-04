import { Endpoint, PayloadRequest, Where } from 'payload'

export const DailyConsumptionApi: Endpoint[] = [
  {
    method: 'get',
    path: '/history',
    handler: async (req: PayloadRequest) => {
      try {
        let { from, to } = req.query
        const { athleteId, page, limit } = req.query

        // Basic validation
        if (!athleteId) {
          return Response.json(
            {
              errors: [{ message: 'ID do atleta é obrigatório' }],
            },
            { status: 400 },
          )
        }

        if (!from) {
          const today = new Date()
          from = today.toISOString().split('T')[0]
        }

        // If to is not provided, use the from date (single day)
        if (!to) {
          to = from
        }

        // Handle pagination parameters
        const parsedLimit = limit ? parseInt(limit as string, 10) : 50
        const validLimit =
          !isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 500 ? parsedLimit : 50 // Default limit

        console.log('Params:', from, to, athleteId, validLimit, page)

        // Find all consumptions in the date range for the athlete
        const consumptionsResult = await req.payload.find({
          collection: 'daily-consumption',
                  // Build the where condition based on date range
where: {
            and: [
              {
                date: {
                  greater_than_equal: from as string,
                  less_than_equal: to as string,
                },
              },
              {
                athlete: {
                  equals: parseInt(athleteId as string, 10),
                },
              },
            ],
          },
          depth: 1, // Include the food collection data
          limit: validLimit,
          page: page ? parseInt(page as string, 10) : undefined,
          sort: 'date', // Sort by date
        })

        return Response.json({
          ...consumptionsResult,
          dateRange: {
            from: from,
            to: to,
          },
        })
      } catch (error) {
        console.error('[DailyConsumptionApi][history]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao obter histórico de consumo' }],
          },
          { status: 500 },
        )
      }
    },
  },
  {
    method: 'get',
    path: '/totals',
    handler: async (req: PayloadRequest) => {
      try {
        let { from, to } = req.query
        const { athleteId, groupBy } = req.query

        // Basic validation
        if (!athleteId) {
          return Response.json(
            {
              errors: [{ message: 'ID do atleta é obrigatório' }],
            },
            { status: 400 },
          )
        }

        if (!from) {
          const today = new Date()
          from = today.toISOString().split('T')[0]
        }

        // If to is not provided, use the from date (single day)
        if (!to) {
          to = from
        }

        console.log('Params for totals:', from, to, athleteId, groupBy)

        // Build the where condition based on date range
        const whereCondition : Where = {
          and: [
            {
              date: {
                greater_than_equal: from as string,
                less_than_equal: to as string,
              },
            },
            {
              athlete: {
                equals: parseInt(athleteId as string, 10),
              },
            },
          ],
        }

        // Find all consumptions in the date range for the athlete without pagination
        // since we need all records to calculate totals
        const consumptionsResult = await req.payload.find({
          collection: 'daily-consumption',
          where: whereCondition,
          depth: 1, // Include the food collection data
          limit: 500, // Set a reasonable high limit (Ninguém come mais que isso, nem o Ramon Dino)
          sort: 'date', // Sort by date
        })

        // Calculate macro totals
        let totals = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        }

        // Group by date if requested
        const groupedTotals: Record<string, { calories: number; protein: number; carbs: number; fat: number; consumptions: number }> = {}

        consumptionsResult.docs.forEach((consumption) => {
          const food = consumption.food
          if (!food) return

          const factor = consumption.quantity_grams / 100 // Convert to 100g units

          const calories = (typeof food === 'object' && food.calories_per_100g ? food.calories_per_100g : 0) * factor
          const protein = (typeof food === 'object' && food.protein_per_100g ? food.protein_per_100g : 0) * factor
          const carbs = (typeof food === 'object' && food.carbs_per_100g ? food.carbs_per_100g : 0) * factor
          const fat = (typeof food === 'object' && food.fat_per_100g ? food.fat_per_100g : 0) * factor

          // Add to overall totals
          totals.calories += calories
          totals.protein += protein
          totals.carbs += carbs
          totals.fat += fat

          // Add to grouped totals if groupBy is specified
          if (groupBy === 'date') {
            const date = consumption.date

            if (!groupedTotals[date]) {
              groupedTotals[date] = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                consumptions: 0,
              }
            }

            groupedTotals[date].calories += calories
            groupedTotals[date].protein += protein
            groupedTotals[date].carbs += carbs
            groupedTotals[date].fat += fat
            groupedTotals[date].consumptions += 1
          }
        })

        // Round totals to 2 decimal places
        totals = {
          calories: Math.round(totals.calories * 100) / 100,
          protein: Math.round(totals.protein * 100) / 100,
          carbs: Math.round(totals.carbs * 100) / 100,
          fat: Math.round(totals.fat * 100) / 100,
        }

        // Round grouped totals if they exist
        if (groupBy === 'date') {
          Object.keys(groupedTotals).forEach((date) => {
            groupedTotals[date] = {
              calories: Math.round(groupedTotals[date].calories * 100) / 100,
              protein: Math.round(groupedTotals[date].protein * 100) / 100,
              carbs: Math.round(groupedTotals[date].carbs * 100) / 100,
              fat: Math.round(groupedTotals[date].fat * 100) / 100,
              consumptions: groupedTotals[date].consumptions,
            }
          })
        }

        return Response.json({
          success: true,
          totals,
          groupedTotals: groupBy === 'date' ? groupedTotals : undefined,
          dateRange: {
            from: from,
            to: to,
          },
          totalConsumptions: consumptionsResult.docs.length,
        })
      } catch (error) {
        console.error('[DailyConsumptionApi][totals]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao calcular totais de nutrientes' }],
          },
          { status: 500 },
        )
      }
    },
  },
]
