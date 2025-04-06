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
  {
    method: 'get',
    path: '/reports/latest',
    handler: async (req: PayloadRequest) => {
      try {
        if (!req.user) {
          return Response.json(
            { errors: [{ message: 'Usuário não autenticado' }] },
            { status: 401 }
          )
        }

        console.log(req.query?.date)
  
        const userId = req.user.id
  
        const athleteProfile = await req.payload.find({
          collection: 'athlete-profiles',
          where: { user: { equals: userId } },
          depth: 0,
        })
  
        if (!athleteProfile.docs?.length) {
          return Response.json(
            { errors: [{ message: 'Perfil de atleta não encontrado' }] },
            { status: 404 }
          )
        }
  
        const athleteId = athleteProfile.docs[0].id
  
        const dateParam = req.query?.date
        const filterDate = dateParam ? new Date(dateParam as string) : new Date()
        filterDate.setHours(23, 59, 59, 999)

        const reports = await req.payload.find({
          collection: 'reports',
          where: {
            and: [
              { athlete: { equals: athleteId } },
              { createdAt: { less_than_equal: filterDate.toISOString() } },
            ],
          },
          sort: '-createdAt',
          limit: 2,
        })

  
        var [latest, previous] = reports.docs
  
        if (!latest) {
          return Response.json(
            { errors: [{ message: 'Nenhum relatório encontrado' }] },
            { status: 404 }
          )
        }

        if(!previous){
          previous = latest
        }
  
        // Parse dos dados principais
        const currentContent = JSON.parse(latest.content)
        const lastContent = previous ? JSON.parse(previous.content) : null
  
        const responseData = {
          weight: currentContent.weight,
          bodyFat: currentContent.bodyFat,
          abdominalFold: currentContent.abdominalFold,
          armMeasurement: currentContent.armMeasurement,
          thighFold: currentContent.thighFold,
          lastAssessment: lastContent
            ? {
                weight: lastContent.weight,
                bodyFat: lastContent.bodyFat,
                abdominalFold: lastContent.abdominalFold,
                armMeasurement: lastContent.armMeasurement,
                thighFold: lastContent.thighFold,
              }
            : undefined,
        }
  
        return Response.json({ data: responseData })
      } catch (error) {
        console.error('[AthleteApi][reports/latest]:', error)
        return Response.json(
          { errors: [{ message: 'Erro inesperado ao buscar relatórios' }] },
          { status: 500 }
        )
      }
    },
  },
  {
    method: 'post',
    path: '/reports/create',
    handler: async (req: PayloadRequest) => {
      try {
        // autenticação
        if (!req.user) return Response.json({ error: 'Usuário não autenticado' }, { status: 401 })
        const userId = req.user.id

        // athleteId
        const athleteProfile = await req.payload.find({ collection: 'athlete-profiles', where: { user: { equals: userId } }, depth: 0 })
        if (!athleteProfile.docs?.length) return Response.json({ error: 'Perfil de atleta não encontrado' }, { status: 404 })
        const athleteId = athleteProfile.docs[0].id

        // dados do formulário
        const { date, weight, bodyFat, abdominalFold, armMeasurement, thighFold } = await req.json()
        if (!date) return Response.json({ error: 'Campo "date" é obrigatório' }, { status: 400 })
        const reportDate = new Date(date)

        // checa duplicidade pelo createdAt
        const start = new Date(reportDate); start.setHours(0, 0, 0, 0)
        const end   = new Date(reportDate); end.setHours(23, 59, 59, 999)

        const dup = await req.payload.find({
          collection: 'reports',
          where: {
            and: [
              { athlete: { equals: athleteId } },
              { createdAt: { greater_than_equal: start.toISOString(), less_than_equal: end.toISOString() } },
            ],
          },
          limit: 1,
        })
        if (dup.totalDocs) return Response.json({ error: 'Já existe relatório para esta data' }, { status: 409 })

        // cria relatório sem campo date, mas com createdAt = reportDate
        const newReport = await req.payload.create({
          collection: 'reports',
          overrideAccess: true,
          data: {
            athlete: athleteId,
            created_by: userId,
            createdAt: reportDate,
            content: JSON.stringify({ weight, bodyFat, abdominalFold, armMeasurement, thighFold }),
          },
        })

        return Response.json({ data: newReport }, { status: 201 })
      } catch (err) {
        console.error('[POST /reports/create]:', err)
        return Response.json({ error: 'Erro inesperado ao salvar relatório' }, { status: 500 })
      }
    },
  },
  
]
