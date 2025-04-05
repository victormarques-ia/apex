import { Endpoint, PayloadRequest } from 'payload'

export const AthleteApi: Endpoint[] = [
  {
    method: 'get',
    path: '/me',
    handler: async (req: PayloadRequest) => {
      try {
        // Check if user is authenticated
        if (!req.user) {
          return Response.json(
            {
              errors: [{ message: 'Usuário não autenticado' }],
            },
            { status: 401 },
          )
        }

        const userId = req.user.id

        // Find the athlete profile associated with the authenticated user
        const athleteProfiles = await req.payload.find({
          collection: 'athlete-profiles',
          where: {
            user: {
              equals: userId,
            },
          },
          depth: 2, // Include related fields
        })

        // Check if athlete profile exists
        if (!athleteProfiles.docs || athleteProfiles.docs.length === 0) {
          return Response.json(
            {
              errors: [{ message: 'Perfil de atleta não encontrado para este usuário' }],
            },
            { status: 404 },
          )
        }

        // Return the first athlete profile found
        return Response.json({
          data: athleteProfiles.docs[0],
        })
      } catch (error) {
        console.error('[AthleteApi][me]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar perfil de atleta' }],
          },
          { status: 500 },
        )
      }
    },
  },
  {
    method: 'get',
    path: '/get-activities',
    handler: async (req: PayloadRequest) => {
      try {
        // Get the athlete ID from the request params
        if (!req.user) {
          return Response.json(
            {
              errors: [{ message: 'Usuário não autenticado' }],
            },
            { status: 401 },
          )
        }
        const userId = req.user.id

        // Get date from query params, default to today
        const dateParam = req.query.date as string
        const date = dateParam || new Date().toISOString().split('T')[0]

        if (!userId) {
          return Response.json(
            {
              errors: [{ message: 'ID do atleta é obrigatório' }],
            },
            { status: 400 },
          )
        }

        // Validate that the athlete exists
        const athleteProfile = await req.payload.find({
          collection: 'athlete-profiles',
          where: {
            user: {
              equals: userId,
            },
          },
          depth: 2, // Include related fields
        })

        if (!athleteProfile) {
          return Response.json(
            {
              errors: [{ message: 'Perfil de atleta não encontrado' }],
            },
            { status: 404 },
          )
        }

        // Parse the date
        const queryDate = new Date(date)
        const formattedQueryDate = queryDate.toISOString().split('T')[0] // YYYY-MM-DD format

        console.log(`Fetching activities for athlete ${userId} on date ${formattedQueryDate}`)

        // Find diet plans that include this date
        const dietPlans = await req.payload.find({
          collection: 'diet-plans',
          where: {
            and: [
              {
                athlete: {
                  equals: userId,
                },
              },
              {
                start_date: {
                  less_than_equal: formattedQueryDate,
                },
              },
              {
                end_date: {
                  greater_than_equal: formattedQueryDate,
                },
              },
            ],
          },
          depth: 1, // Include related nutritionist
        })

        // Find workout plans that include this date
        const workoutPlans = await req.payload.find({
          collection: 'workout-plans',
          where: {
            and: [
              {
                athlete: {
                  equals: userId,
                },
              },
              {
                start_date: {
                  less_than_equal: formattedQueryDate,
                },
              },
              {
                end_date: {
                  greater_than_equal: formattedQueryDate,
                },
              },
            ],
          },
          depth: 1, // Include related trainer
        })

        // Check for meal plans from diet plan days
        const dietPlanDays = await req.payload.find({
          collection: 'diet-plan-days',
          where: {
            and: [
              {
                date: {
                  equals: formattedQueryDate,
                },
              },
              {
                diet_plan: {
                  in: dietPlans.docs.map((plan) => plan.id),
                },
              },
            ],
          },
          depth: 2, // Include related diet plan and meals
        })

        // Get meals for the diet plan days
        const mealPromises = dietPlanDays.docs.map(async (day) => {
          const meals = await req.payload.find({
            collection: 'meal',
            where: {
              diet_plan_day: {
                equals: day.id,
              },
            },
            depth: 2, // Include meal foods
          })
          return meals.docs
        })

        const mealsNestedArray = await Promise.all(mealPromises)
        const meals = mealsNestedArray.flat()

        // Simplify and format activities for the client
        const activities = [
          // Format meals as schedule items
          ...meals.map((meal: any) => ({
            time: meal.scheduled_time
              ? new Date(meal.scheduled_time).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '12:00',
            activity: meal.meal_type || 'Refeição',
            type: 'meal',
            status: 'pending', // Default status
            details: meal.notes || null,
          })),

          // Add workout activities (simplified for now)
          ...workoutPlans.docs.map((workout: any) => ({
            time: '08:00', // Default time since workouts don't have time in the schema
            activity: `Treino: ${workout.goal || 'Treino programado'}`,
            type: 'workout',
            status: 'pending',
            details: workout.goal || '',
          })),

          // Add a hydration reminder if there are any activities
          ...(meals.length > 0 || workoutPlans.docs.length > 0
            ? [
                {
                  time: '08:00',
                  activity: '2000ml Água - Para ser tomada durante o dia',
                  type: 'hydration',
                  status: 'pending',
                },
              ]
            : []),
        ]

        // Sort activities by time
        activities.sort((a, b) => {
          const timeA = a.time.split(':').map(Number)
          const timeB = b.time.split(':').map(Number)
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
        })

        return Response.json({
          data: {
            date: formattedQueryDate,
            activities,
            dietPlans: dietPlans.docs,
            workoutPlans: workoutPlans.docs,
            meals,
          },
        })
      } catch (error) {
        console.error('[AthleteApi][get-activities]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar atividades do atleta' }],
          },
          { status: 500 },
        )
      }
    },
  },
]
