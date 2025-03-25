'use server'
import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'
import { User } from '@/payload-types'

// Define types for API responses
interface ApiResponse<T> {
  data: T | null
  error?: {
    messages: string[]
    status: number
  }
}

interface UserResponse {
  id: number
  email: string
  name: string
}

interface AthleteProfileResponse {
  id: number
  [key: string]: any
}

interface UserDocsResponse {
  docs: UserResponse[]
  totalDocs: number
  [key: string]: any
}

interface ProfileDocsResponse {
  docs: {
    id: number
    [key: string]: any
  }[]
  [key: string]: any
}

interface RelationshipResponse {
  id: number
  [key: string]: any
}

interface AthleteRegistrationResponse extends AthleteProfileResponse {
  trainerRelationship: boolean
  nutritionistRelationship: boolean
}

// Type for searchForId function
type SearchableObject = {
  id?: number
  _id?: number
  [key: string]: any
}

export async function registerAthleteAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // First, ensure we have a user ID
      if (!data.userId) {
        throw new Error('ID do usuário é obrigatório para registrar um atleta')
      }

      // TODO: In the future, this should come from the agency dashboard context/session
      // For now, we're hardcoding the agency ID as the page is part of the agency dashboard
      const agencyId = 2

      // Prepare the athlete profile data for submission
      const athleteProfileData = {
        agency: agencyId, // Fixed agency ID
        user: parseInt(data.userId as string, 10), // Convert to number
        weight: data.weight ? parseFloat(data.weight as string) : null,
        height: data.height ? parseFloat(data.height as string) : null,
        birth_date: data.birthDate as string,
        gender: data.gender as string,
        dietary_habits: data.nutritionalHabits as string,
        physical_activity_habits: data.physicalActivityHabits as string,
        goal: data.objectives as string,
      }

      console.log('Submitting athlete profile data:', JSON.stringify(athleteProfileData, null, 2))

      // Submit the athlete profile through the API
      const result = await fetchFromApi<AthleteProfileResponse>('/api/athlete-profiles', {
        method: 'POST',
        body: JSON.stringify(athleteProfileData),
      })

      if (!result.data) {
        console.error('Error response from API:', result.error)
        throw new Error(result.error?.messages?.[0] || 'Erro ao registrar perfil do atleta')
      }

      // Extract the athlete profile ID from the response
      let athleteProfileId: number | null = null

      // Function to recursively search for an ID in an object
      const searchForId = (obj: SearchableObject): number | null => {
        if (!obj || typeof obj !== 'object') return null

        if (obj.id !== undefined) return obj.id
        if (obj._id !== undefined) return obj._id

        for (const key in obj) {
          if (key === 'id' || key === '_id') {
            if (typeof obj[key] === 'number') return obj[key]
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const result = searchForId(obj[key])
            if (result !== null) return result
          }
        }
        return null
      }

      if (result.data.id) {
        athleteProfileId = result.data.id
      } else {
        athleteProfileId = searchForId(result.data as SearchableObject)
      }

      if (athleteProfileId === null) {
        console.error('Unable to extract athlete profile ID from response')
        throw new Error('ID do perfil de atleta não encontrado na resposta')
      }

      console.log(`Athlete profile created with ID: ${athleteProfileId}`)

      // Response object will track the relationships created
      const response: AthleteRegistrationResponse = {
        ...result.data,
        id: athleteProfileId,
        trainerRelationship: false,
        nutritionistRelationship: false,
      }

      // Handle trainer relationship if trainer email is provided
      if (data.trainerEmail) {
        try {
          // First, find the trainer user by email
          const trainerUserResult = await fetchFromApi<UserDocsResponse>(
            `/api/users?where[email][equals]=${encodeURIComponent(data.trainerEmail as string)}`,
            { method: 'GET' },
          )

          if (!trainerUserResult.data?.docs?.length) {
            console.log(`No user found with email ${data.trainerEmail}`)
            return response
          }

          const trainerUserId = trainerUserResult.data.docs[0].id
          console.log(`Found trainer user with ID: ${trainerUserId}`)

          // Find the trainer profile for this user
          const trainerResult = await fetchFromApi<ProfileDocsResponse>(
            `/api/trainers?where[user][equals]=${trainerUserId}`,
            { method: 'GET' },
          )

          if (!trainerResult.data?.docs?.length) {
            console.log(`User ${trainerUserId} is not a trainer`)
            return response
          }

          const trainerId = trainerResult.data.docs[0].id
          console.log(`Found trainer profile with ID: ${trainerId}`)

          // Check if trainer is part of the agency
          const agencyProfResult = await fetchFromApi<ProfileDocsResponse>(
            `/api/agency-professionals?where[professional][equals]=${trainerUserId}&where[agency][equals]=${agencyId}`,
            { method: 'GET' },
          )

          if (!agencyProfResult.data?.docs?.length) {
            console.log(`Trainer ${trainerUserId} is not part of agency ${agencyId}`)
            return response
          }

          console.log(`Confirmed trainer ${trainerUserId} is part of agency ${agencyId}`)

          // Create trainer-athlete relationship
          const trainerRelationshipData = {
            trainer: parseInt(trainerId.toString(), 10),
            athlete: athleteProfileId,
          }

          const trainerRelationResult = await fetchFromApi<RelationshipResponse>(
            '/api/trainer-athletes',
            {
              method: 'POST',
              body: JSON.stringify(trainerRelationshipData),
            },
          )

          if (trainerRelationResult.data) {
            console.log(`Created trainer-athlete relationship successfully`)
            response.trainerRelationship = true
          }
        } catch (error) {
          console.error('Error creating trainer-athlete relationship:', error)
        }
      }

      // Handle nutritionist relationship if nutritionist email is provided
      if (data.nutritionistEmail) {
        try {
          // First, find the nutritionist user by email
          const nutritionistUserResult = await fetchFromApi<UserDocsResponse>(
            `/api/users?where[email][equals]=${encodeURIComponent(data.nutritionistEmail as string)}`,
            { method: 'GET' },
          )

          if (!nutritionistUserResult.data?.docs?.length) {
            console.log(`No user found with email ${data.nutritionistEmail}`)
            return response
          }

          const nutritionistUserId = nutritionistUserResult.data.docs[0].id
          console.log(`Found nutritionist user with ID: ${nutritionistUserId}`)

          // Find the nutritionist profile for this user
          const nutritionistResult = await fetchFromApi<ProfileDocsResponse>(
            `/api/nutritionists?where[user][equals]=${nutritionistUserId}`,
            { method: 'GET' },
          )

          if (!nutritionistResult.data?.docs?.length) {
            console.log(`User ${nutritionistUserId} is not a nutritionist`)
            return response
          }

          const nutritionistId = nutritionistResult.data.docs[0].id
          console.log(`Found nutritionist profile with ID: ${nutritionistId}`)

          // Check if nutritionist is part of the agency
          const agencyProfResult = await fetchFromApi<ProfileDocsResponse>(
            `/api/agency-professionals?where[professional][equals]=${nutritionistUserId}&where[agency][equals]=${agencyId}`,
            { method: 'GET' },
          )

          if (!agencyProfResult.data?.docs?.length) {
            console.log(`Nutritionist ${nutritionistUserId} is not part of agency ${agencyId}`)
            return response
          }

          console.log(`Confirmed nutritionist ${nutritionistUserId} is part of agency ${agencyId}`)

          // Create nutritionist-athlete relationship
          const nutritionistRelationshipData = {
            nutritionist: parseInt(nutritionistId.toString(), 10),
            athlete: athleteProfileId,
          }

          const nutritionistRelationResult = await fetchFromApi<RelationshipResponse>(
            '/api/nutritionist-athletes',
            {
              method: 'POST',
              body: JSON.stringify(nutritionistRelationshipData),
            },
          )

          if (nutritionistRelationResult.data) {
            console.log(`Created nutritionist-athlete relationship successfully`)
            response.nutritionistRelationship = true
          }
        } catch (error) {
          console.error('Error creating nutritionist-athlete relationship:', error)
        }
      }

      return response
    },
    {
      onSuccess: function (data) {
        return {
          success: true,
          data,
          message: 'Perfil do atleta registrado com sucesso',
        }
      },
      onFailure: function (error) {
        console.error('Registration failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao registrar perfil do atleta',
        }
      },
    },
  )
}

// Function to generate a random password
function generateRandomPassword(length = 10): string {
  // TODO: This is way too simple to be secure, we should change it later
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  return password
}

export interface CreateUserResponse {
  id: number
  email: string
  name: string
  isExistingUser: boolean
}

export async function createUserAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // Validate required fields
      if (!data.name || !data.email) {
        throw new Error('Nome e email são obrigatórios')
      }

      // Check if user with this email already exists
      const checkUserResult = await fetchFromApi<UserDocsResponse>(
        `/api/users?where[email][equals]=${encodeURIComponent(data.email as string)}`,
        { method: 'GET' },
      )

      // If user already exists, return that user instead of trying to create a new one
      if (checkUserResult.data && checkUserResult.data.docs?.length > 0) {
        const existingUser = checkUserResult.data.docs[0]
        console.log(
          `User with email ${data.email} already exists, returning existing user ID: ${existingUser.id}`,
        )

        // Return the existing user but with a flag indicating it's an existing user
        return {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          isExistingUser: true, // Flag to indicate this is an existing user
        } as CreateUserResponse
      }

      // Generate a random temporary password
      const temporaryPassword = generateRandomPassword()

      // Prepare user data for submission
      const userData = {
        name: data.name as string,
        email: data.email as string,
        password: temporaryPassword, // Add the temporary password
        role: 'athlete', // Setting default role as athlete
      }

      console.log('Creating new user with data:', {
        ...userData,
        password: '********', // Hide the actual password in logs
      })

      // Submit the user through the API
      const result = await fetchFromApi<UserResponse>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      if (!result.data) {
        console.error('Error creating user:', result.error)
        throw new Error(result.error?.messages?.[0] || 'Erro ao criar usuário')
      }

      // Extract user ID from the response using searchForId
      const searchForId = (obj: SearchableObject): number | null => {
        if (!obj || typeof obj !== 'object') return null

        if (obj.id !== undefined) return obj.id
        if (obj._id !== undefined) return obj._id

        for (const key in obj) {
          if (key === 'id' || key === '_id') {
            if (typeof obj[key] === 'number') return obj[key]
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const result = searchForId(obj[key])
            if (result !== null) return result
          }
        }
        return null
      }

      let userId: number | null = null

      if (result.data.id) {
        userId = result.data.id
      } else {
        userId = searchForId(result.data as SearchableObject)
      }

      // If ID is still not found, try to fetch the user by email
      if (userId === null) {
        const fetchUserResult = await fetchFromApi<UserDocsResponse>(
          `/api/users?where[email][equals]=${encodeURIComponent(data.email as string)}`,
          { method: 'GET' },
        )

        if (
          fetchUserResult.data &&
          fetchUserResult.data.docs &&
          fetchUserResult.data.docs.length > 0
        ) {
          userId = fetchUserResult.data.docs[0].id
        }
      }

      if (userId === null) {
        throw new Error('ID do usuário não encontrado na resposta')
      }

      // In a real implementation, you would send an email here with the reset link
      console.log(
        `User created successfully. User ID: ${userId}. Password reset email would be sent to ${data.email}`,
      )

      return {
        id: userId,
        email: data.email as string,
        name: data.name as string,
        isExistingUser: false,
      } as CreateUserResponse
    },
    {
      onSuccess: function (data) {
        return {
          success: true,
          data,
          message: 'Usuário criado com sucesso',
        }
      },
      onFailure: function (error) {
        console.error('User creation failure:', error)
        return {
          success: false,
          error,
          message: 'Falha ao criar usuário',
        }
      },
    },
  )
}
