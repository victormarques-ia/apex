import { format, addDays } from 'date-fns'

// --- Configuração ---
const API_URL_BASE = process.env.PAYLOAD_PUBLIC_SITE_URL || 'http://localhost:3000'
const API_ENDPOINT = `${API_URL_BASE}/api`

let payloadToken: string | null = null

interface ApiResponse {
  doc?: { id: string | number } // Payload geralmente retorna o doc criado
  id?: string | number // Fallback se o id estiver no nível raiz
  message?: string
  errors?: any[]
  token?: string // Para a resposta de login/registro
  [key: string]: any // Para outras propriedades
}

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any // Será stringificado se for JSON
  contentType?: string // Padrão 'application/json'
  useFormData?: boolean // Para o registro inicial
}

// --- Funções Auxiliares ---

/**
 * Formata uma data para YYYY-MM-DD.
 */
function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Formata uma data para ISO String com Z (UTC).
 */
function formatDateTimeUTC(date: Date): string {
  // O toISOString() já retorna no formato correto UTC (YYYY-MM-DDTHH:mm:ss.sssZ)
  return date.toISOString()
}

/**
 * Função para fazer chamadas à API PayloadCMS.
 * Extrai o ID do documento criado na resposta.
 */
async function apiCall(endpoint: string, options: ApiCallOptions = {}): Promise<string | number> {
  const { method = 'POST', body, contentType = 'application/json', useFormData = false } = options
  const url = `${API_ENDPOINT}/${endpoint}`

  console.log(`🔄 Creating ${endpoint}...`)

  const headers: { [key: string]: string } = {}

  if (payloadToken) {
    headers['Cookie'] = `payload-token=${payloadToken}`
  }

  let requestBody: any
  if (useFormData && body) {
    requestBody = body
  } else if (body) {
    headers['Content-Type'] = contentType
    requestBody = JSON.stringify(body)
  } else {
    headers['Content-Type'] = contentType
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
    })

    const responseData: ApiResponse = await response.json()

    if (!response.ok || responseData.errors) {
      console.error(`❌ Failed to create ${endpoint}`)
      console.error('Status:', response.status, response.statusText)
      console.error('Response:', JSON.stringify(responseData, null, 2))
      throw new Error(`API call failed for ${endpoint}: ${responseData.message || 'Unknown error'}`)
    }

    // Payload geralmente retorna o documento criado dentro de 'doc'
    const id = responseData.doc?.id ?? responseData.id

    if (!id) {
      // Se for a chamada de login/registro, pode não retornar um 'id', mas sim um 'token'
      if (responseData.token) {
        console.log(`✅ Operation successful for ${endpoint} (Token received)`)
        return ''
      }
      console.error(`❌ Failed to extract ID from response for ${endpoint}`)
      console.error('Response:', JSON.stringify(responseData, null, 2))
      throw new Error(`Could not find ID in response for ${endpoint}`)
    }

    console.log(`✅ Created ${endpoint} with ID: ${id}`)
    return id
  } catch (error) {
    console.error(`❌ Error during API call to ${endpoint}:`, error)
    // Propaga o erro para parar o script se necessário
    throw error
  }
}

// --- Script Principal ---
async function runMockDataGenerator() {
  console.log('=== PayloadCMS Mock Data Generator (TypeScript) ===')
  if (payloadToken) {
    console.log(`Using pre-existing token: ${payloadToken.substring(0, 20)}...`)
  }
  console.log('=======================================')

  try {
    // Step 0: Create first user and get token
    console.log('\n🆕 Creating First User...')
    const formData = new FormData() // Use FormData
    formData.append(
      '_payload',
      JSON.stringify({
        role: 'athlete',
        name: 'test',
        email: 'test@test.com',
        password: 'password123',
        'confirm-password': 'password123', // Payload espera confirmação
      }),
    )

    const firstRegisterResponse = await fetch(`${API_ENDPOINT}/users/first-register`, {
      method: 'POST',
      body: formData,
    })

    const firstRegisterData: ApiResponse = await firstRegisterResponse.json()

    if (!firstRegisterResponse.ok || !firstRegisterData.token) {
      console.error('❌ Failed to register first user')
      console.error('Status:', firstRegisterResponse.status, firstRegisterResponse.statusText)
      console.error('Response:', JSON.stringify(firstRegisterData, null, 2))
      process.exit(1) // Sai se não conseguir o token inicial
    }

    payloadToken = firstRegisterData.token
    console.log('✅ First user created and token retrieved')
    console.log(`Using token: ${payloadToken.substring(0, 20)}...`)

    // --- Criação das Entidades ---

    // Step 1: Create Users
    console.log('\n🧑 Creating Users...')
    const agencyUserId = await apiCall('users', {
      body: {
        email: 'agency@test.com',
        password: 'password123',
        role: 'agency',
        name: 'Test Agency',
      },
    })
    const nutritionistUserId = await apiCall('users', {
      body: {
        email: 'nutritionist@test.com',
        password: 'password123',
        role: 'nutritionist',
        name: 'Jéssica',
      },
    })
    const athleteUserId = await apiCall('users', {
      body: { email: 'athlete@test.com', password: 'password123', role: 'athlete', name: 'Bianca' },
    })
    const trainerUserId = await apiCall('users', {
      body: { email: 'trainer@test.com', password: 'password123', role: 'trainer', name: 'Paulo' },
    })

    // Step 2: Create Agency
    console.log('\n🏢 Creating Agency...')
    const agencyId = await apiCall('agencies', {
      body: {
        user: agencyUserId,
        name: 'Test Agency Organization',
        contact_info: 'contact@testagency.com',
      },
    })

    // Step 3: Create Nutritionist profile
    console.log('\n🥗 Creating Nutritionist...')
    const nutritionistId = await apiCall('nutritionists', {
      body: {
        user: nutritionistUserId,
        license_number: 'NUT12345',
        specialization: 'Sports Nutrition',
      },
    })

    // Step 3: Create Trainer profile
    console.log('\n🤸 Creating Trainer...')
    const trainerId = await apiCall('trainers', {
      body: { user: trainerUserId, certification: 'EF12345', specialization: 'high performance' },
    })

    // Step 4: Create Athlete profile
    console.log('\n🏋️ Creating Athlete Profile...')
    const athleteId = await apiCall('athlete-profiles', {
      body: {
        user: athleteUserId,
        agency: agencyId,
        weight: 75,
        height: 180,
        dietary_habits: 'Prefers high-protein meals',
        physical_activity_habits: 'Trains 5 days a week',
        birth_date: '1995-05-15',
        gender: 'Male',
        goal: 'Muscle gain and performance improvement',
      },
    })

    // Step 5: Create Agency-Professional relationship (Nutritionist)
    console.log('\n🔗 Creating Agency-Professional Relationship (Nutritionist)...')
    await apiCall('agency-professionals', {
      body: { agency: agencyId, professional: nutritionistUserId, role: 'Lead Nutritionist' },
    })

    // Step 6: Create Agency-Professional relationship (Trainer)
    console.log('\n🔗 Creating Agency-Professional Relationship (Trainer)...')
    await apiCall('agency-professionals', {
      body: { agency: agencyId, professional: trainerUserId, role: 'trainer' },
    })

    // Step 7: Create Nutritionist-Athlete relationship
    console.log('\n🔗 Creating Nutritionist-Athlete Relationship...')
    await apiCall('nutritionist-athletes', {
      body: { nutritionist: nutritionistId, athlete: athleteId },
    })

    // Step 7: Create Trainer-Athlete relationship
    console.log('\n🔗 Creating Trainer-Athlete Relationship...')
    await apiCall('trainer-athletes', { body: { trainer: trainerId, athlete: athleteId } })

    // Step 8: Create Food items
    console.log('\n🍗 Creating Food Items...')
    const food1Id = await apiCall('food', {
      body: {
        name: 'Chicken Breast',
        calories_per_100g: 165,
        protein_per_100g: 31,
        carbs_per_100g: 0,
        fat_per_100g: 3.6,
      },
    })
    const food2Id = await apiCall('food', {
      body: {
        name: 'Brown Rice',
        calories_per_100g: 112,
        protein_per_100g: 2.6,
        carbs_per_100g: 23.5,
        fat_per_100g: 0.9,
      },
    })
    const food3Id = await apiCall('food', {
      body: {
        name: 'Broccoli',
        calories_per_100g: 34,
        protein_per_100g: 2.8,
        carbs_per_100g: 6.6,
        fat_per_100g: 0.4,
      },
    })

    // Step 8: Create Diet Plan
    console.log('\n📋 Creating Diet Plan...')
    const today = new Date()
    const nextMonth = addDays(today, 30)
    const todayFormatted = formatDate(today)
    const nextMonthFormatted = formatDate(nextMonth)

    const dietPlanId = await apiCall('diet-plans', {
      body: {
        athlete: athleteId,
        nutritionist: nutritionistId,
        start_date: todayFormatted,
        end_date: nextMonthFormatted,
        total_daily_calories: 2500,
        notes:
          'Focus on high-protein meals with complex carbs. Adjust based on training intensity.',
      },
    })

    // Step 9: Create Diet Plan Days
    console.log('\n📆 Creating Diet Plan Days...')
    // Nota: Payload pode não precisar do 'day_of_week' se calcular a partir da data
    const dietPlanDay1Id = await apiCall('diet-plan-days', {
      body: { diet_plan: dietPlanId, date: todayFormatted },
    })

    const tomorrow = addDays(today, 1)
    const tomorrowFormatted = formatDate(tomorrow)
    const dietPlanDay2Id = await apiCall('diet-plan-days', {
      body: { diet_plan: dietPlanId, date: tomorrowFormatted },
    })

    // Step 10: Create Meals
    console.log('\n🍽️ Creating Meals...')
    const todayAt8AM = new Date(today)
    todayAt8AM.setUTCHours(8, 0, 0, 0) // Define como 8:00 UTC

    const todayAt1PM = new Date(today)
    todayAt1PM.setUTCHours(13, 0, 0, 0) // Define como 13:00 UTC

    const meal1Id = await apiCall('meal', {
      body: {
        diet_plan_day: dietPlanDay1Id,
        meal_type: 'Breakfast',
        scheduled_time: formatDateTimeUTC(todayAt8AM),
        order_index: 1,
      },
    })
    const meal2Id = await apiCall('meal', {
      body: {
        diet_plan_day: dietPlanDay1Id,
        meal_type: 'Lunch',
        scheduled_time: formatDateTimeUTC(todayAt1PM),
        order_index: 2,
      },
    })

    // Step 11: Create Meal-Food associations
    console.log('\n🍳 Creating Meal-Food Associations...')
    await apiCall('meal-food', { body: { meal: meal1Id, food: food2Id, quantity_grams: 100 } })
    await apiCall('meal-food', { body: { meal: meal2Id, food: food1Id, quantity_grams: 150 } })
    await apiCall('meal-food', { body: { meal: meal2Id, food: food2Id, quantity_grams: 200 } })
    await apiCall('meal-food', { body: { meal: meal2Id, food: food3Id, quantity_grams: 150 } })

    // Step 12: Create Daily Consumption records
    console.log('\n🍴 Creating Daily Consumption Records...')
    await apiCall('daily-consumption', {
      body: { athlete: athleteId, food: food1Id, date: todayFormatted, quantity_grams: 125 },
    })
    await apiCall('daily-consumption', {
      body: { athlete: athleteId, food: food2Id, date: todayFormatted, quantity_grams: 175 },
    })

    // Step 13: Create Exercises
    console.log('\n💪 Creating Exercises...')
    const exercise1Id = await apiCall('exercises', {
      body: {
        name: 'Avanço com Halteres',
        description:
          'Fortalece glúteos, quadríceps e isquiotibiais, ajudando na estabilidade e impulsão na corrida.',
        muscle_group: 'Pernas',
      },
    })
    const exercise2Id = await apiCall('exercises', {
      body: {
        name: 'Prancha Abdominal',
        description:
          'Exercício isométrico para fortalecimento do core, essencial para manter a postura durante a corrida.',
        muscle_group: 'Abdômen',
      },
    })
    const exercise3Id = await apiCall('exercises', {
      body: {
        name: 'Elevação de Panturrilhas',
        description:
          'Trabalha os músculos da panturrilha, importantes para a propulsão e absorção de impacto.',
        muscle_group: 'Panturrilhas',
      },
    })

    // Step 14: Create Workout Plan
    console.log('\n🏃 Creating Workout Plan...')
    const workoutPlanId = await apiCall('workout-plans', {
      body: {
        athlete: athleteId,
        trainer: trainerId,
        start_date: todayFormatted,
        end_date: nextMonthFormatted,
        goal: 'Preparação para prova de 10 km. Foco em resistência, técnica e prevenção de lesões.',
      },
    })

    // Step 15: Add Exercise to Workout Plan (Exercise Workouts)
    console.log('\n📌 Adding Exercises to Workout Plan...')
    await apiCall('exercise-workouts', {
      body: {
        workout_plan: workoutPlanId,
        exercise: exercise1Id,
        sets: 3,
        reps: 12,
        rest_seconds: 60,
        notes: 'Manter boa postura durante o movimento. Foco em controle e estabilidade.',
      },
    })
    await apiCall('exercise-workouts', {
      body: {
        workout_plan: workoutPlanId,
        exercise: exercise2Id,
        sets: 3,
        reps: 1,
        rest_seconds: 30,
        notes: 'Segurar posição por 30 segundos em cada série.',
      },
    }) // Reps = 1 para isométrico, duração na nota
    await apiCall('exercise-workouts', {
      body: {
        workout_plan: workoutPlanId,
        exercise: exercise3Id,
        sets: 4,
        reps: 15,
        rest_seconds: 45,
        notes: 'Executar lentamente. Foco no alongamento e contração da panturrilha.',
      },
    })

    // Step 16: Log Physical Activity
    console.log('\n🗓️ Logging Physical Activity...')
    await apiCall('physical-activity-logs', {
      body: {
        athlete: athleteId,
        workout_plan: workoutPlanId, // Associa ao plano, se relevante
        date: todayFormatted,
        duration_minutes: 45,
        calories_burned: 520,
      },
    })

    // --- Conclusão ---
    console.log('\n✅ Mock data generation complete!')
    console.log('- Users: Agency, Nutritionist, Athlete, Trainer')
    console.log('- Agency with relationships')
    console.log('- Nutritionist/Trainer with Athlete relationship')
    console.log('- Athlete Profile')
    console.log('- Food items')
    console.log('- Diet Plan with Days and Meals/Foods')
    console.log('- Daily Consumption records')
    console.log('- Exercises')
    console.log('- Workout Plan with Exercises')
    console.log('- Physical Activity Log')
    console.log('\nAll ready for testing!')
  } catch (error) {
    console.error('\n❌ An error occurred during mock data generation:', error)
    process.exit(1) // Encerra com erro
  }
}

// --- Executar o Script ---
runMockDataGenerator()
