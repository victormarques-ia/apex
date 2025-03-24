'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { addConsumptionAction, deleteConsumptionAction, getDailyConsumptionsAction } from './actions/dailyConsumption.action'
import { searchFoodsAction } from '../../nutrition/actions/foods.action'

export default function DailyConsumptionPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [consumptions, setConsumptions] = useState<any[]>([])
  const [foods, setFoods] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  
  // Simula o ID do atleta logado - em produção virá da autenticação
  const athleteId = "1"
  
  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      foodId: '',
      quantity_grams: 100,
    },
  })

  // Fetch consumption data for the selected date
  useEffect(() => {
    const fetchConsumptions = async () => {
      try {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('athleteId', athleteId)
        formData.append('from', date)
        formData.append('to', date)
        
        const result = await getDailyConsumptionsAction(null, formData)
        
        if (result.success) {
          setConsumptions(result.data.consumptionsResult.docs || [])
          
          // Calcular totais nutricionais baseado nos consumos
          const totals = (result.data.consumptionsResult.docs || []).reduce(
            (acc, consumption) => {
              const food = consumption.food
              if (!food) return acc
              
              const factor = consumption.quantity_grams / 100
              
              acc.calories += (food.calories_per_100g || 0) * factor
              acc.protein += (food.protein_per_100g || 0) * factor
              acc.carbs += (food.carbs_per_100g || 0) * factor
              acc.fat += (food.fat_per_100g || 0) * factor
              
              return acc
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          )
          
          setNutritionTotals({
            calories: Math.round(totals.calories),
            protein: Math.round(totals.protein),
            carbs: Math.round(totals.carbs),
            fat: Math.round(totals.fat),
          })
        }
      } catch (error) {
        console.error('Error fetching consumption data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchConsumptions()
  }, [date, athleteId])

  // Search foods when query changes
  useEffect(() => {
    const searchFoods = async () => {
      if (searchQuery.length < 2) {
        setFoods([])
        return
      }
      
      try {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('query', searchQuery)
        
        console.log('Searching for foods with query:', searchQuery)
        const result = await searchFoodsAction(null, formData)
        console.log('Search result:', result)
        
        if (result.success) {
          setFoods(result.data.docs || [])
          console.log('Food results:', result.data.docs)
        }
      } catch (error) {
        console.error('Error searching foods:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    searchFoods()
  }, [searchQuery])

  const onSubmit = async (data: { foodId: string; quantity_grams: number }) => {
    if (!data.foodId) {
      console.error('No food selected')
      return
    }
    
    try {
      setIsLoading(true)
      
      const formData = new FormData()
      formData.append('athleteId', athleteId)
      formData.append('foodId', data.foodId)
      formData.append('date', date)
      formData.append('quantity_grams', data.quantity_grams.toString())
      
      const result = await addConsumptionAction(null, formData)
      
      if (result.success) {
        // Refresh the consumption list
        const refreshFormData = new FormData()
        refreshFormData.append('athleteId', athleteId)
        refreshFormData.append('from', date)
        refreshFormData.append('to', date)
        
        const refreshResult = await getDailyConsumptionsAction(null, refreshFormData)
        
        if (refreshResult.success) {
          setConsumptions(refreshResult.data.consumptionsResult.docs || [])
          
          // Recalcular totais
          const totals = (refreshResult.data.consumptionsResult.docs || []).reduce(
            (acc, consumption) => {
              const food = consumption.food
              if (!food) return acc
              
              const factor = consumption.quantity_grams / 100
              
              acc.calories += (food.calories_per_100g || 0) * factor
              acc.protein += (food.protein_per_100g || 0) * factor
              acc.carbs += (food.carbs_per_100g || 0) * factor
              acc.fat += (food.fat_per_100g || 0) * factor
              
              return acc
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          )
          
          setNutritionTotals({
            calories: Math.round(totals.calories),
            protein: Math.round(totals.protein),
            carbs: Math.round(totals.carbs),
            fat: Math.round(totals.fat),
          })
        }
        
        // Limpar o formulário
        setSelectedFoodId(null)
        setSearchQuery('')
        reset()
      } else {
        console.error('Failed to add consumption:', result.error)
      }
    } catch (error) {
      console.error('Error adding consumption:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (consumptionId: string) => {
    try {
      setIsLoading(true)
      
      const formData = new FormData()
      formData.append('id', consumptionId)
      
      const result = await deleteConsumptionAction(null, formData)
      
      if (result.success) {
        // Refresh the consumption list
        const refreshFormData = new FormData()
        refreshFormData.append('athleteId', athleteId)
        refreshFormData.append('from', date)
        refreshFormData.append('to', date)
        
        const refreshResult = await getDailyConsumptionsAction(null, refreshFormData)
        
        if (refreshResult.success) {
          setConsumptions(refreshResult.data.consumptionsResult.docs || [])
          
          // Recalcular totais
          const totals = (refreshResult.data.consumptionsResult.docs || []).reduce(
            (acc, consumption) => {
              const food = consumption.food
              if (!food) return acc
              
              const factor = consumption.quantity_grams / 100
              
              acc.calories += (food.calories_per_100g || 0) * factor
              acc.protein += (food.protein_per_100g || 0) * factor
              acc.carbs += (food.carbs_per_100g || 0) * factor
              acc.fat += (food.fat_per_100g || 0) * factor
              
              return acc
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          )
          
          setNutritionTotals({
            calories: Math.round(totals.calories),
            protein: Math.round(totals.protein),
            carbs: Math.round(totals.carbs),
            fat: Math.round(totals.fat),
          })
        }
      }
    } catch (error) {
      console.error('Error deleting consumption:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registro de Consumo Diário</h1>
      
      <div className="mb-6">
        <label className="block mb-2">Data:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded w-full md:w-64"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Adicionar Alimento</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2">Buscar Alimento:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do alimento"
                className="p-2 border rounded w-full"
              />
              
              {foods.length > 0 && (
                <div className="mt-2 border rounded max-h-48 overflow-y-auto">
                  {foods.map((food) => (
                    <div 
                      key={food.id} 
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedFoodId(food.id.toString())
                        setValue('foodId', food.id.toString())
                        setSearchQuery(food.name)
                        setFoods([])
                      }}
                    >
                      <p>{food.name}</p>
                      <p className="text-sm text-gray-600">
                        {food.calories_per_100g} kcal | P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | G: {food.fat_per_100g}g
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block mb-2">Quantidade (g):</label>
              <input
                type="number"
                {...register('quantity_grams', { required: true, min: 1 })}
                className="p-2 border rounded w-full"
              />
            </div>
            
            {/* Campo oculto para o foodId */}
            <input 
              type="hidden" 
              {...register('foodId')} 
              value={selectedFoodId || ''} 
            />
            
            <button 
              type="submit" 
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              disabled={!selectedFoodId || isLoading}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Alimentos Consumidos</h2>
          
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Total Nutricional:</h3>
            <p>Calorias: {nutritionTotals.calories} kcal</p>
            <p>Proteínas: {nutritionTotals.protein}g</p>
            <p>Carboidratos: {nutritionTotals.carbs}g</p>
            <p>Gorduras: {nutritionTotals.fat}g</p>
          </div>
          
          {consumptions.length > 0 ? (
            <div className="space-y-2">
              {consumptions.map((consumption) => {
                const food = consumption.food
                return (
                  <div key={consumption.id} className="p-3 border rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-sm">{consumption.quantity_grams}g</p>
                      <p className="text-sm text-gray-600">
                        {Math.round((food.calories_per_100g || 0) * consumption.quantity_grams / 100)} kcal
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(consumption.id.toString())}
                      className="text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      {isLoading ? '...' : 'Remover'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum alimento registrado para esta data.</p>
          )}
        </div>
      </div>
    </div>
  )
}
