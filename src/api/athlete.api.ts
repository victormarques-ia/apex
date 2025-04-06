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
        const athleteId = athleteProfile.docs[0].id

        // Parse the date - create a new date with the provided date to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number)
        const queryDate = new Date(year, month - 1, day) // months are 0-indexed in JS
        const formattedQueryDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        console.log(
          `[get-activities] Fetching activities for athlete ${athleteId} on date ${formattedQueryDate}`,
        )

        // Get all diet plans for the athlete
        const allDietPlans = await req.payload.find({
          collection: 'diet-plans',
          where: {
            athlete: {
              equals: athleteId,
            },
          },
          depth: 1, // Include related nutritionist
        })

        console.log(
          `[get-activities] Found ${allDietPlans.docs.length} diet plans for athlete ${athleteId}`,
        )

        // Filter diet plans to only include those where the query date falls between start and end date
        const dietPlans = {
          ...allDietPlans,
          docs: allDietPlans.docs.filter((plan) => {
            const startDate = new Date(plan.start_date).toISOString().split('T')[0]
            const endDate = new Date(plan.end_date).toISOString().split('T')[0]
            return startDate <= formattedQueryDate && endDate >= formattedQueryDate
          }),
        }

        console.log(
          `[get-activities] Found ${dietPlans.docs.length} diet plans for the date ${formattedQueryDate}`,
        )

        // Get all workout plans for the athlete
        const allWorkoutPlans = await req.payload.find({
          collection: 'workout-plans',
          where: {
            athlete: {
              equals: athleteId,
            },
          },
          depth: 1, // Include related trainer
        })

        // Filter workout plans to only include those where the query date falls between start and end date
        const workoutPlans = {
          ...allWorkoutPlans,
          docs: allWorkoutPlans.docs.filter((plan) => {
            const startDate = new Date(plan.start_date).toISOString().split('T')[0]
            const endDate = new Date(plan.end_date).toISOString().split('T')[0]

            return startDate <= formattedQueryDate && endDate >= formattedQueryDate
          }),
        }

        console.log(
          `[get-activities] Found ${workoutPlans.docs.length} workout plans for the date ${formattedQueryDate}`,
        )

        // FIX: Correct way to get day of the week in Portuguese
        // getDay() returns: 0 = Sunday, 1 = Monday, etc.
        const dayOfWeek = queryDate.getDay()

        const daysOfWeekShort = [
          'domingo',
          'segunda',
          'terça',
          'quarta',
          'quinta',
          'sexta',
          'sábado',
        ]
        const daysOfWeekLong = [
          'domingo',
          'segunda-feira',
          'terça-feira',
          'quarta-feira',
          'quinta-feira',
          'sexta-feira',
          'sábado',
        ]

        const queryDayNameShort = daysOfWeekShort[dayOfWeek]
        const queryDayNameLong = daysOfWeekLong[dayOfWeek]

        console.log(
          `[get-activities] Query date ${formattedQueryDate} is ${queryDayNameLong} (day ${dayOfWeek})`,
        )

        // Get all diet plan days for the filtered diet plans
        const allDietPlanDays = await req.payload.find({
          collection: 'diet-plan-days',
          where: {
            diet_plan: {
              in: dietPlans.docs.map((plan) => plan.id),
            },
          },
          depth: 1,
        })

        if (dietPlans.docs.length === 0) {
          allDietPlanDays.docs = []
        }

        console.log(
          `[get-activities] Found ${allDietPlanDays.docs.length} total diet plan days to check`,
        )
        console.log(
          `[get-activities] All diet plan days: ${JSON.stringify(allDietPlanDays.docs.map((d) => ({ id: d.id, day_of_week: d.day_of_week })))}`,
        )

        // Filter diet plan days to match either exact date or day of week
        const dietPlanDays = {
          ...allDietPlanDays,
          docs: allDietPlanDays.docs.filter((day) => {
            // Check for day of week match
            if (day.day_of_week) {
              // Normalize the day of week from the database
              const normalizedDayOfWeek = day.day_of_week.toString().trim().toLowerCase()

              // Collection of possible day formats to match against
              const possibleDayFormats = [
                queryDayNameShort.toLowerCase(), // e.g. 'segunda'
                queryDayNameLong.toLowerCase(), // e.g. 'segunda-feira'
                String(dayOfWeek), // 0-6 (JS day - Sunday = 0)
                String(dayOfWeek + 1), // 1-7 (Common 1-indexed format - Sunday = 1)
                (dayOfWeek + 1).toString().padStart(2, '0'), // 01-07 (Monday = 01)
              ]

              // Check if any format matches
              const isMatch = possibleDayFormats.some((format) => normalizedDayOfWeek === format)

              console.log(
                `[get-activities] Checking day of week: "${day.day_of_week}" (normalized: "${normalizedDayOfWeek}") against formats:`,
                possibleDayFormats,
                `Result: ${isMatch}`,
              )

              // Print IDs of matched days for debugging
              if (isMatch) {
                console.log(
                  `[get-activities] ✓ Found day of week match for day ID ${day.id} (${day.day_of_week})`,
                )
                return true
              }
            }

            return false
          }),
        }

        console.log(
          `[get-activities] Found ${dietPlanDays.docs.length} diet plan days for date ${formattedQueryDate}`,
        )
        console.log(
          `[get-activities] Matched diet plan days: ${JSON.stringify(dietPlanDays.docs.map((d) => ({ id: d.id, day_of_week: d.day_of_week })))}`,
        )

        // Get meals for the diet plan days
        const mealPromises = dietPlanDays.docs.map(async (day) => {
          console.log(`[get-activities] Fetching meals for diet plan day ID ${day.id}`)
          const meals = await req.payload.find({
            collection: 'meal',
            where: {
              diet_plan_day: {
                equals: day.id,
              },
            },
            depth: 2, // Include meal foods
          })
          console.log(
            `[get-activities] Found ${meals.docs.length} meals for diet plan day ${day.id}`,
          )
          return meals.docs
        })

        const mealsNestedArray = await Promise.all(mealPromises)
        const meals = mealsNestedArray.flat()
        console.log(`[get-activities] Total meals: ${meals.length}`)

        // Fetch meal foods for all meals
        const mealIdsArray = meals.map((meal) => meal.id)

        // Fetch all meal foods for the meals we found
        const mealFoods = await req.payload.find({
          collection: 'meal-food',
          where: {
            meal: {
              in: mealIdsArray,
            },
          },
          depth: 2, // Include full food details
        })

        console.log(`[get-activities] Found ${mealFoods.docs.length} meal foods for all meals`)

        // Group meal foods by meal ID for easier access
        const mealFoodsByMealId = mealFoods.docs.reduce((acc, mealFood) => {
          const mealId = typeof mealFood.meal === 'object' ? mealFood.meal.id : mealFood.meal
          if (!acc[mealId]) {
            acc[mealId] = []
          }
          acc[mealId].push(mealFood)
          return acc
        }, {})

        // Simplify and format activities for the client
        const activities = [
          // Format meals as schedule items with food details
          ...meals.map((meal) => {
            const mealId = meal.id
            const mealFoodsForMeal = mealFoodsByMealId[mealId] || []

            // Map the meal foods to the required format
            const foodsDetails = mealFoodsForMeal.map((mealFood) => {
              // Handle both cases where food might be an ID or an object
              const food =
                typeof mealFood.food === 'object'
                  ? mealFood.food
                  : { id: mealFood.food, name: 'Unknown Food' }

              return {
                id: mealFood.id,
                food: {
                  id: food.id,
                  name: food.name,
                },
                quantity: mealFood.quantity_grams,
              }
            })

            return {
              time: meal.scheduled_time
                ? new Date(meal.scheduled_time).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '12:00',
              activity: meal.meal_type || 'Refeição',
              type: 'meal',
              status: 'pending', // Default status
              diet_plan: meal.diet_plan_day.diet_plan, // Include the full diet plan object, not just the ID
              details: meal.description || '',
              foods: foodsDetails,
            }
          }),

          // Add workout activities without time element
          ...workoutPlans.docs.map((workout) => ({
            time: '',
            activity: `Treino: ${workout.goal || 'Treino programado'}`,
            type: 'workout',
            status: 'pending',
            details: workout.goal || '',
          })),
        ]

        // Sort activities by time (only for activities with time)
        activities.sort((a, b) => {
          // If an activity doesn't have time, put it at the end
          if (!a.time) return 1
          if (!b.time) return -1

          // Both have time, compare them
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
