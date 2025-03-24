'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, X, Loader } from 'lucide-react'
import { addConsumptionAction,
         deleteConsumptionAction,
         getDailyConsumptionsAction } from './actions/dailyConsumption.action'
import { searchFoodsAction } from '../../nutrition/actions/foods.action'

// Card components
const Card = ({ className, children, ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`} {...props}>
    {children}
  </div>
)

const CardHeader = ({ className, children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`} {...props}>
    {children}
  </h3>
)

const CardContent = ({ className, children, ...props }) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props}>
    {children}
  </div>
)

export default function DailyConsumptionPage() {
  const athleteId = '1' // @TODO: Add atheleteId fetch

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [consumptions, setConsumptions] = useState([])
  const [foods, setFoods] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState(100)
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  
  // Fetch consumption data for the selected date
  useEffect(() => {
    fetchConsumptions()
  }, [date])

  // Search foods when query changes
  useEffect(() => {
    if (searchQuery.length < 2) {
      setFoods([])
      return
    }
    
    searchFoods()
  }, [searchQuery])

  // Fetch consumption data
  const fetchConsumptions = async () => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('athleteId', athleteId)
      formData.append('from', date)
      
      const result = await getDailyConsumptionsAction(null, formData)
      const consumptionDocs = result.data.docs || []

      console.log('Consumption API response:', result)
      console.log('Consumptions found:', consumptionDocs.length)

      setConsumptions(consumptionDocs)
      calculateNutritionTotals(consumptionDocs)
      setNutritionTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 })
    } catch (error) {
      console.error('Error fetching consumption data:', error)
      setConsumptions([])
      setNutritionTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  // Search foods
  const searchFoods = async () => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('q', searchQuery)
      formData.append('limit', '10')
      const result = await searchFoodsAction(null, formData)
      const foodDocs = result.data.docs || []
      setFoods(foodDocs)
    } catch (error) {
      console.error('Error searching foods:', error)
      setFoods([])
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate nutrition totals
  const calculateNutritionTotals = (consumptionData) => {
    const totals = consumptionData.reduce(
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

  // Add consumption
  const addConsumption = async () => {
    if (!selectedFood) {
      return
    }
    
    try {
      setIsLoading(true)
      
      const formData = new FormData()
      formData.append('athleteId', athleteId)
      formData.append('foodId', selectedFood.id.toString())
      formData.append('date', date)
      formData.append('quantity_grams', quantity.toString())
      
      const result = await addConsumptionAction(null, formData)
      
      await fetchConsumptions()
        
      setSelectedFood(null)
      setSearchQuery('')
      setQuantity(100)
      setFoods([])
    } catch (error) {
      console.error('Error adding consumption:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete consumption
  const deleteConsumption = async (consumptionId) => {
    try {
      setIsLoading(true)
      
      const formData = new FormData()
      formData.append('id', consumptionId)
      
      const result = await deleteConsumptionAction(null, formData)
      await fetchConsumptions()

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
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full md:w-64"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna de adição de alimentos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Alimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Busca de alimentos */}
                <div className="space-y-2">
                  <label className="block">Buscar Alimento:</label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Digite o nome do alimento"
                      className="pl-10 w-full"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  
                  {/* Resultados da busca */}
                  {foods.length > 0 && (
                    <div className="mt-2 border rounded max-h-48 overflow-y-auto">
                      {foods.map((food) => (
                        <div 
                          key={food.id} 
                          className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedFood?.id === food.id ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            setSelectedFood(food);
                            setSearchQuery(food.name);
                            setFoods([]);
                          }}
                        >
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-gray-600">
                            {food.calories_per_100g} kcal | P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | G: {food.fat_per_100g}g
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Seleção de quantidade */}
                {selectedFood && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="block">Alimento Selecionado:</label>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSelectedFood(null);
                          setSearchQuery('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-2 border rounded bg-gray-50">
                      <p className="font-medium">{selectedFood.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedFood.calories_per_100g} kcal | P: {selectedFood.protein_per_100g}g | C: {selectedFood.carbs_per_100g}g | G: {selectedFood.fat_per_100g}g
                      </p>
                    </div>
                    
                    <div>
                      <label className="block">Quantidade (g):</label>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        min="1"
                        className="w-full"
                      />
                    </div>
                    
                    <Button 
                      onClick={addConsumption} 
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Adicionar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna de alimentos consumidos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Alimentos Consumidos</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Total nutricional */}
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Total Nutricional:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center justify-center p-2 bg-white rounded border">
                    <span className="text-sm text-gray-500">Calorias</span>
                    <span className="font-bold text-lg">{nutritionTotals.calories} kcal</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-white rounded border">
                    <span className="text-sm text-gray-500">Proteínas</span>
                    <span className="font-bold text-lg">{nutritionTotals.protein}g</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-white rounded border">
                    <span className="text-sm text-gray-500">Carboidratos</span>
                    <span className="font-bold text-lg">{nutritionTotals.carbs}g</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-white rounded border">
                    <span className="text-sm text-gray-500">Gorduras</span>
                    <span className="font-bold text-lg">{nutritionTotals.fat}g</span>
                  </div>
                </div>
              </div>
              
              {/* Lista de alimentos consumidos */}
              {isLoading && consumptions.length === 0 ? (
                <div className="flex items-center justify-center p-4">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando...</span>
                </div>
              ) : consumptions.length > 0 ? (
                <div className="space-y-2">
                  {consumptions.map((consumption) => {
                    // Verifica se consumption e food existem e têm as propriedades necessárias
                    if (!consumption || !consumption.food) {
                      console.warn('Invalid consumption data:', consumption)
                      return null
                    }
                    
                    const food = consumption.food
                    let foodName = 'Alimento'
                    let calories = 0
                    
                    // Verifica se as propriedades do food estão disponíveis
                    if (typeof food === 'object') {
                      foodName = food.name || 'Alimento sem nome'
                      calories = Math.round((food.calories_per_100g || 0) * consumption.quantity_grams / 100)
                    } else if (typeof food === 'string') {
                      foodName = food
                    }
                    
                    return (
                      <div key={consumption.id} className="p-3 border rounded flex justify-between items-center">
                        <div>
                          <p className="font-medium">{foodName}</p>
                          <p className="text-sm">{consumption.quantity_grams}g</p>
                          <p className="text-sm text-gray-600">
                            {calories} kcal
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteConsumption(consumption.id.toString())}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum alimento registrado para esta data.</p>
                  <p className="text-sm text-gray-400">Adicione alimentos usando o formulário ao lado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

