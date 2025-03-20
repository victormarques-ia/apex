'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { DailyConsumption, Food } from 'payload'
import { addConsumptionAction, deleteConsumptionAction } from '../actions/consumption.actions'

export default function DailyConsumptionPage({ athleteId }: { athleteId: string }) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [consumptions, setConsumptions] = useState<DailyConsumption[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  
  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      foodId: '',
      quantity: 100,
    },
  })

  // Fetch consumption data for the selected date
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/athlete/${athleteId}/consumption?date=${date}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Consumption data:', data)
          setConsumptions(data.docs || [])
          setNutritionTotals(data.nutritionTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 })
        } else {
          console.error('Failed to fetch consumption data:', await response.text())
        }
      } catch (error) {
        console.error('Error fetching consumption data:', error)
      }
    }
    
    fetchData()
  }, [date, athleteId])

  // Search foods
  useEffect(() => {
    const fetchFoods = async () => {
      const response = await fetch(`/api/foods?search=${searchQuery}`)
      if (response.ok) {
        const data = await response.json()
        setFoods(data.docs || [])
      }
    }
    
    if (searchQuery.length > 2) {
      fetchFoods()
    }
  }, [searchQuery])

  const onSubmit = async (data: { foodId: string; quantity: number }) => {
    console.log('Form submitted with data:', data)
    console.log('AthleteId:', athleteId)
    console.log('Date:', date)
    console.log('Selected food ID:', selectedFoodId)
    
    // Usar o selectedFoodId se disponível, senão usar o do formulário
    const foodIdToUse = selectedFoodId || data.foodId
    
    if (!foodIdToUse) {
      console.error('No food selected')
      return
    }
    
    try {
      console.log('Calling addConsumptionAction with:', athleteId, foodIdToUse, date, data.quantity)
      const result = await addConsumptionAction(athleteId, foodIdToUse, date, data.quantity)
      console.log('Action result:', result)
      
      if (result.success) {
        console.log('Refreshing consumption data for date:', date)
        // Refresh the consumption list
        const response = await fetch(`/api/athlete/${athleteId}/consumption?date=${date}`)
        console.log('Refresh response status:', response.status)
        
        if (response.ok) {
          const refreshData = await response.json()
          console.log('Updated consumption data:', refreshData)
          console.log('Docs in response:', refreshData.docs?.length || 0)
          setConsumptions(refreshData.docs || [])
          setNutritionTotals(refreshData.nutritionTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 })
        } else {
          console.error('Failed to refresh data:', await response.text())
        }
        
        // Limpar o valor selecionado
        setSelectedFoodId(null)
        setSearchQuery('')
        reset()
      } else {
        console.error('Failed to add consumption:', result.error)
      }
    } catch (error) {
      console.error('Error in onSubmit:', error)
    }
  }

  const handleDelete = async (consumptionId: string) => {
    try {
      console.log('Deleting consumption with ID:', consumptionId)
      const result = await deleteConsumptionAction(consumptionId)
      console.log('Delete result:', result)
      
      if (result.success) {
        // Refresh the consumption list
        const response = await fetch(`/api/athlete/${athleteId}/consumption?date=${date}`)
        if (response.ok) {
          const data = await response.json()
          setConsumptions(data.docs || [])
          setNutritionTotals(data.nutritionTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 })
        }
      }
    } catch (error) {
      console.error('Error deleting consumption:', error)
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
                        console.log('Selected food:', food)
                        setSelectedFoodId(food.id.toString())
                        setValue('foodId', food.id.toString()) // Configurar no formulário também
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
                {...register('quantity', { required: true, min: 1 })}
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
              disabled={!selectedFoodId} // Desabilitar se nenhum alimento for selecionado
            >
              Adicionar
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
                const food = consumption.food as Food
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
                    >
                      Remover
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
