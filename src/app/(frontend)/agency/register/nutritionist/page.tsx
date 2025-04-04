'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createUserAction,
  registerNutritionistAction,
} from '../actions/register.action'
import RegisterLayout from '../components/register-layout'

// Zod validation schema aligned with server actions
const schema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  license_number: z.string().optional(),
  specialization: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterNutritionistPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Use react-hook-form with zod resolver
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      license_number: '',
      specialization: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // Step 1: Create or find the user
      const userFormData = new FormData()
      userFormData.append('name', data.name)
      userFormData.append('email', data.email)
      userFormData.append('role', 'nutritionist')

      const userResult = await createUserAction(null, userFormData)
      console.log('User creation result:', userResult)

      if (!userResult || userResult.error) {
        throw new Error(userResult?.error || 'Erro ao criar usuário')
      }

      // Get user data
      const userData = userResult.data
      if (!userData) {
        throw new Error('Dados do usuário não retornados')
      }

      // Extract user ID and check if user already existed
      const userId = userData.id
      const isExistingUser = userData.isExistingUser

      if (isExistingUser) {
        toast.info(`Usando usuário existente com email ${data.email}`)
      } else {
        toast.success('Usuário criado com sucesso')
      }

      // Step 2: Create nutritionist profile
      const nutritionistFormData = new FormData()
      nutritionistFormData.append('userId', userId.toString())

      // Add all optional fields
      if (data.license_number) nutritionistFormData.append('licenseNumber', data.license_number)
      if (data.specialization) nutritionistFormData.append('specialization', data.specialization)

      const nutritionistResult = await registerNutritionistAction(null, nutritionistFormData)
      console.log('Nutritionist registration result:', nutritionistResult)

      // Handle nutritionist creation result
      if (!nutritionistResult || !('data' in nutritionistResult) || !nutritionistResult.data) {
        throw new Error(nutritionistResult?.error || 'Erro ao registrar perfil do nutricionista')
      }

      // Show success message and redirect
      toast.success('Perfil do nutricionista registrado com sucesso')
      form.reset()
      router.push('/agency/register/nutritionist')
    } catch (err) {
      console.error('Registration error:', err)

      // Special handling for athlete already exists error
      const errorMsg = err instanceof Error ? err.message : 'Ocorreu um erro inesperado'

      if (errorMsg.includes('já possui um perfil de nutricionista')) {
        toast.error('Este usuário já possui um perfil de nutricionista cadastrado')
      } else {
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RegisterLayout>
      <div className="bg-white border border-zinc-200 rounded-md mt-6 p-6">
        <h2 className="text-lg font-medium text-zinc-900 mb-4">Perfil</h2>
        <div className="w-full border-t border-zinc-200 mb-6"></div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">Nome</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite seu nome completo"
                      className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite seu email"
                      type="email"
                      className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">
                    Número de Registro
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite seu número de registro"
                      className="mt-2 h-15 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">
                    Especialização
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite sua especialização"
                      className="mt-2 h-15 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-8">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-800 hover:bg-blue-900 text-white rounded-md py-2 px-4 w-32"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </RegisterLayout>
  )
}
