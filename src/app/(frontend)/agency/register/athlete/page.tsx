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
import { registerAthleteAction, createUserAction } from '../actions/register.action'
import RegisterLayout from '../components/register-layout'

// Zod validation schema aligned with server actions
const schema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  weight: z.string().optional(),
  height: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['Masculino', 'Feminino', 'Outro', '']).optional(),
  nutritionalHabits: z.string().optional(),
  physicalActivityHabits: z.string().optional(),
  objectives: z.string().optional(),
  trainerEmail: z
    .string()
    .email({ message: 'Email do treinador inválido' })
    .optional()
    .or(z.literal('')),
  nutritionistEmail: z
    .string()
    .email({ message: 'Email do nutricionista inválido' })
    .optional()
    .or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function RegisterAthletePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Use react-hook-form with zod resolver
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      weight: '',
      height: '',
      birthDate: '',
      gender: '',
      nutritionalHabits: '',
      physicalActivityHabits: '',
      objectives: '',
      trainerEmail: '',
      nutritionistEmail: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      // Step 1: Create or find the user
      const userFormData = new FormData()
      userFormData.append('name', data.name)
      userFormData.append('email', data.email)

      const userResult = await createUserAction(null, userFormData)

      // Handle user creation result
      if (!userResult || !('data' in userResult) || !userResult.data) {
        throw new Error(userResult?.error || 'Erro ao criar usuário')
      }

      // Extract user ID and check if user already existed
      const userData = userResult.data
      const userId = userData.id
      const isExistingUser = userData.isExistingUser

      if (isExistingUser) {
        toast.info(`Usando usuário existente com email ${data.email}`)
      } else {
        toast.success('Usuário criado com sucesso')
      }

      // Step 2: Create athlete profile
      const athleteFormData = new FormData()
      athleteFormData.append('userId', userId.toString())
      athleteFormData.append('weight', data.weight || '')
      athleteFormData.append('height', data.height || '')
      athleteFormData.append('birthDate', data.birthDate || '')
      athleteFormData.append('gender', data.gender || '')
      athleteFormData.append('nutritionalHabits', data.nutritionalHabits || '')
      athleteFormData.append('physicalActivityHabits', data.physicalActivityHabits || '')
      athleteFormData.append('objectives', data.objectives || '')
      athleteFormData.append('trainerEmail', data.trainerEmail || '')
      athleteFormData.append('nutritionistEmail', data.nutritionistEmail || '')

      const athleteResult = await registerAthleteAction(null, athleteFormData)

      // Handle athlete creation result
      if (!athleteResult || !('data' in athleteResult) || !athleteResult.data) {
        throw new Error(athleteResult?.error || 'Erro ao registrar perfil do atleta')
      }

      // Check if relationships were created
      const warnings = []
      if (data.trainerEmail && !athleteResult.data.trainerRelationship) {
        warnings.push(
          `Treinador com email ${data.trainerEmail} não encontrado ou não está disponível para esta agência`,
        )
      }

      if (data.nutritionistEmail && !athleteResult.data.nutritionistRelationship) {
        warnings.push(
          `Nutricionista com email ${data.nutritionistEmail} não encontrado ou não está disponível para esta agência`,
        )
      }

      // Show warnings if any
      warnings.forEach((warning) => toast.warning(warning))

      // Show success message and redirect
      toast.success('Perfil do atleta registrado com sucesso')
      form.reset()
      router.push('/agency/register/athlete')
    } catch (err) {
      console.error('Registration error:', err)
      toast.error(err instanceof Error ? err.message : 'Ocorreu um erro inesperado')
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
              name="nutritionalHabits"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">
                    Hábitos Alimentares
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Descreva seus hábitos alimentares"
                      className="mt-2 h-15 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-4 gap-5 mb-4">
              <div>
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-zinc-900">Peso</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Kg"
                          className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-zinc-900">Altura</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="cm"
                          className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-zinc-900">
                        Data de Nascimento
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">Gênero</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    >
                      <option value="">Selecione o gênero</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">Objetivos</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Quais são seus objetivos?"
                      className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="physicalActivityHabits"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">
                    Atividades Físicas
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Descreva suas atividades físicas habituais"
                      className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainerEmail"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">
                    E-mail do Treinador
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@treinador.com"
                      className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">
                    Insira o e-mail de um treinador cadastrado na agência
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nutritionistEmail"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-sm font-medium text-zinc-900">
                    E-mail do Nutricionista
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@nutricionista.com"
                      className="mt-2 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">
                    Insira o e-mail de um nutricionista cadastrado na agência
                  </p>
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
