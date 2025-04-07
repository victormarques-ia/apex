'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader } from 'lucide-react'
import { addExerciseAction } from '@/app/(frontend)/trainer/actions/exercises.action'

interface CreateExerciseFormProps {
  onExerciseCreated: (exercise: any) => void
  onCancel: () => void
}

// Common muscle groups
const muscleGroups = [
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Abdômen',
  'Glúteos',
  'Antebraço',
  'Panturrilha',
  'Cardio',
  'Corpo inteiro',
]

export function CreateExerciseForm({ onExerciseCreated, onCancel }: CreateExerciseFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract exercise from response to handle different API responses
  function extractExercise(response) {
    // Case 1: Direct object
    if (response && response.id && response.name) {
      return response
    }

    // Case 2: Inside data
    if (response.data && response.data.id && response.data.name) {
      return response.data
    }

    console.log('Could not extract exercise from response:', response)

    // Return a fallback object with the provided name
    return {
      id: Date.now(), // Use timestamp as fallback ID
      name: name,
      muscle_group: muscleGroup,
      description: description,
    }
  }

  // Handle form submission
  const handleCreateExercise = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!name) {
        setError('Nome do exercício é obrigatório')
        return
      }

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('muscleGroup', muscleGroup)

      console.log('Creating exercise with data:', { name, description, muscleGroup })

      const response = await addExerciseAction(null, formData)
      console.log('Create exercise response:', response)

      if (response.success !== false) {
        const newExercise = extractExercise(response.data || response)
        console.log('Extracted new exercise:', newExercise)

        if (onExerciseCreated) {
          onExerciseCreated(newExercise)
        }
      } else {
        setError(response.message || 'Erro ao criar exercício')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar exercício'
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Exercício</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

        <div className="space-y-4">
          {/* Exercise name */}
          <div>
            <Label htmlFor="exercise-name">Nome do Exercício</Label>
            <Input
              id="exercise-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Supino reto"
              required
            />
          </div>

          {/* Muscle group selection */}
          <div>
            <Label htmlFor="muscle-group">Grupo Muscular</Label>
            <Select value={muscleGroup} onValueChange={setMuscleGroup}>
              <SelectTrigger id="muscle-group">
                <SelectValue placeholder="Selecione o grupo muscular" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva como executar o exercício corretamente"
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleCreateExercise}
          disabled={loading || !name}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : 'Criar Exercício'}
        </Button>
      </CardFooter>
    </Card>
  )
}
