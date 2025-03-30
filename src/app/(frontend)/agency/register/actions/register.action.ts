'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'
import { generateRandomString } from 'node_modules/@payloadcms/payload-cloud/dist/plugin'
import { password } from 'node_modules/payload/dist/fields/validations'

// Define types for API responses
export interface CreateUserResponse {
  id: number
  email: string
  name: string
  isExistingUser: boolean
}

export interface AthleteRegistrationResponse {
  id: number
  [key: string]: any
}

export interface RegisterAthleteResponseData {
  profile: AthleteRegistrationResponse
  trainerRelationship: boolean
  nutritionistRelationship: boolean
}

// Function to generate a random password
function generateRandomPassword() {
  const randomString = generateRandomString()
  const passwordLength = 8 // Define the desired password length
  return randomString.slice(0, passwordLength)
}

/**
 * Creates a new user or returns an existing one if the email already exists
 */
export async function createUserAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // Simple validation
      if (!data.name || !data.email) {
        throw new Error('Nome e email são obrigatórios')
      }

      try {
        // First check if the user already exists
        const checkUserResult = await fetchFromApi<{ docs: any[] }>(
          `/api/users?where[email][equals]=${encodeURIComponent(data.email as string)}`,
          { method: 'GET' },
        )

        console.log('Check user result:', checkUserResult)

        // If user already exists, return that user
        if (checkUserResult.data?.docs && checkUserResult.data.docs.length > 0) {
          const existingUser = checkUserResult.data.docs[0]
          console.log('Found existing user:', existingUser.id)

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            isExistingUser: true, // Flag to indicate this is an existing user
          }
        }

        // If user doesn't exist, create a new one
        const result = await fetchFromApi<any>('/api/users', {
          method: 'POST',
          body: JSON.stringify({
            name: data.name,
            password: generateRandomPassword(),
            email: data.email,
            role: data.role || 'athlete',
          }),
        })

        if (!result.data) {
          throw new Error(result.error?.messages?.[0] || 'Erro ao criar usuário')
        }
        console.log('Created new user:', result.data.doc.id)

        // Return the created user data
        return {
          id: result.data.doc.id,
          email: result.data.doc.email,
          name: result.data.doc.name,
          isExistingUser: false,
        }
      } catch (error) {
        console.error('Error creating user:', error)
        throw new Error(
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as any).message)
            : 'Erro ao criar usuário',
        )
      }
    },
    {
      onSuccess: function (data) {
        return {
          success: true,
          data,
          message: data.isExistingUser
            ? 'Usuário existente recuperado com sucesso'
            : 'Usuário criado com sucesso',
        }
      },
      onFailure: function (error: unknown) {
        let errorMessage = 'Erro ao criar usuário'
        if (typeof error === 'object' && error !== null) {
          // @ts-ignore
          errorMessage = error.message || errorMessage
        }
        return {
          success: false,
          error: errorMessage,
          message: 'Falha ao criar usuário',
        }
      },
    },
  )
}

/**
 * Server action to register an athlete - delegates processing to API
 */
export async function registerAthleteAction(_state: unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      // Validate required field
      if (!data.userId) {
        throw new Error('ID do usuário é obrigatório')
      }

      try {
        // Call the API endpoint directly to handle athlete registration
        const result = await fetchFromApi<RegisterAthleteResponseData>(
          '/api/agencies/register-athlete',
          {
            method: 'POST',
            body: JSON.stringify({
              userId: data.userId,
              weight: data.weight || null,
              height: data.height || null,
              birthDate: data.birthDate || null,
              gender: data.gender || null,
              nutritionalHabits: data.nutritionalHabits || null,
              physicalActivityHabits: data.physicalActivityHabits || null,
              objectives: data.objectives || null,
              trainerEmail: data.trainerEmail || null,
              nutritionistEmail: data.nutritionistEmail || null,
            }),
          },
        )

        console.log('Athlete registration result:', result)

        if (!result.data) {
          // Check for specific error related to duplicate athlete profile
          if (
            result.error?.messages?.some((msg) => msg.includes('já possui um perfil de atleta'))
          ) {
            throw new Error('Este usuário já possui um perfil de atleta cadastrado')
          }
          throw new Error(result.error?.messages?.[0] || 'Erro ao registrar perfil de atleta')
        }

        return result.data
      } catch (error) {
        console.error('Error during athlete registration:', error)
        throw new Error(
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as any).message)
            : 'Erro ao registrar atleta',
        )
      }
    },
    {
      onSuccess: function (data) {
        return {
          success: true,
          data,
          message: 'Perfil do atleta registrado com sucesso',
        }
      },
      onFailure: function (error: unknown) {
        let errorMessage = 'Erro ao registrar perfil do atleta'
        if (typeof error === 'object' && error !== null) {
          // @ts-ignore
          errorMessage = error.message || errorMessage
        }
        return {
          success: false,
          error: errorMessage,
          message: 'Falha ao registrar perfil do atleta',
        }
      },
    },
  )
}
