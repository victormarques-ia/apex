'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, X, Loader, AlertCircle } from 'lucide-react'
import { addConsumptionAction,
         deleteConsumptionAction,
         getDailyConsumptionsAction,
         getNutritionalTotalsAction } from './actions/dailyConsumption.action'
import { getAthleteProfileAction } from '../actions/athlete.action'
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
  const [athleteId, setAthleteId] = useState<string | null>(null)
  const [athleteProfile, setAthleteProfile] = useState<any>(null)
  const [athleteLoading, setAthleteLoading] = useState(true)
  const [athleteError, setAthleteError] = useState<string | null>(null)
  
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
  
  // Fetch athlete profile on component mount
  useEffect(() => {
    const fetchAthleteProfile = async () => {
      try {
        setAthleteLoading(true)
        setAthleteError(null)
        
        const formData = new FormData()
        const result = await getAthleteProfileAction(null, formData)

        console.log(result)

        if (result.data.data){
          setAthleteProfile(result.data.data)
          setAthleteId(result.data.data.id.toString())
          console.log('Athlete profile loaded:', result.data.data);
        } else {
        setAthleteError('Não foi possível carregar o perfil do atleta')
        console.error('Failed to load athlete profile:', result.error)
        }
      } catch (error) {
        setAthleteError('Erro ao carregar o perfil do atleta')
        console.error('Error fetching athlete profile:', error)
      } finally {
        setAthleteLoading(false)
      }
    }
    
    fetchAthleteProfile()
  }, [])
  
  // Fetch consumption data when date or athleteId changes
  useEffect(() => {
    if (athleteId) {
      fetchConsumptions()
    }
  }, [date, athleteId])

  // Search foods when query changes
  useEffect(() => {
    if (searchQuery.length < 2) {
      setFoods([])
      return
    }
    
    searchFoods()
  }, [searchQuery])

  // Fetch consumption data and nutritional totals
  const fetchConsumptions = async () => {
    if (!athleteId) return
    
    try {
      setIsLoading(true)
      
      // Prepare form data
      const formData = new FormData()
      formData.append('athleteId', athleteId)
      formData.append('from', date)
      formData.append('to', date)
      
      // Fetch consumption data
      const result = await getDailyConsumptionsAction(null, formData)
      
      // Log response and handle consumption data
      console.log('Consumption API response:', result)
      const consumptionDocs = result.data?.docs || []
      console.log('Consumptions found:', consumptionDocs.length)
      setConsumptions(consumptionDocs)
      
      // Fetch nutritional totals
      const totalsFormData = new FormData()
      totalsFormData.append('athleteId', athleteId)
      totalsFormData.append('from', date)
      totalsFormData.append('to', date)
      
      const totalsResult = await getNutritionalTotalsAction(null, totalsFormData)
      
      if (totalsResult.success && totalsResult.data?.totals) {
        // Set nutrition totals from API
        const { totals } = totalsResult.data
        setNutritionTotals({
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein),
          carbs: Math.round(totals.carbs),
          fat: Math.round(totals.fat),
        })
      } else {
        // Fallback to manual calculation
        calculateNutritionTotals(consumptionDocs)
      }
    } catch (error) {
      console.error('Error fetching consumption data:', error)
      setConsumptions([])
      setNutritionTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate nutrition totals (fallback method)
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

  // Search foods
  const searchFoods = async () => {
    try {
      const formData = new FormData()
      formData.append('q', searchQuery)
      formData.append('limit', '10')
      const result = await searchFoodsAction(null, formData)
      const foodDocs = result.data?.docs || []
      setFoods(foodDocs)
    } catch (error) {
      console.error('Error searching foods:', error)
      setFoods([])
    }
  }

  // Add consumption
  const addConsumption = async () => {
    if (!selectedFood || !athleteId) {
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

  // Render the nutrition bar chart
  const renderNutritionBar = () => {
    const proteinCal = nutritionTotals.protein * 4
    const carbsCal = nutritionTotals.carbs * 4
    const fatCal = nutritionTotals.fat * 9
    const totalCal = proteinCal + carbsCal + fatCal
    
    if (totalCal === 0) return null
    
    const proteinPct = (proteinCal / totalCal) * 100
    const carbsPct = (carbsCal / totalCal) * 100
    const fatPct = (fatCal / totalCal) * 100
    
    return (
      <div className="mt-4">
        <h5 className="text-sm font-medium mb-1">Distribuição de Macros</h5>
        <div className="h-6 rounded-full overflow-hidden bg-gray-200 flex">
          <div 
            className="bg-red-400 h-full text-xs text-white flex items-center justify-center"
            style={{ width: `${proteinPct}%` }}
          >
            {proteinPct >= 10 ? `${Math.round(proteinPct)}%` : ''}
          </div>
          <div 
            className="bg-yellow-400 h-full text-xs text-white flex items-center justify-center"
            style={{ width: `${carbsPct}%` }}
          >
            {carbsPct >= 10 ? `${Math.round(carbsPct)}%` : ''}
          </div>
          <div 
            className="bg-green-400 h-full text-xs text-white flex items-center justify-center"
            style={{ width: `${fatPct}%` }}
          >
            {fatPct >= 10 ? `${Math.round(fatPct)}%` : ''}
          </div>
        </div>
        <div className="flex text-xs mt-1 justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
            Proteínas
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
            Carboidratos
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            Gorduras
          </div>
        </div>
      </div>
    )
  }

  // If we're loading the athlete profile, show a loading state
  if (athleteLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg">Carregando perfil do atleta...</p>
        </div>
      </div>
    )
  }

  // If there was an error loading the athlete profile, show an error state
  if (athleteError || !athleteId) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar perfil</h2>
          <p className="text-red-700 mb-6">{athleteError || 'Perfil de atleta não encontrado'}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registro de Consumo Diário</h1>
      
      {/* Display athlete info */}
      {athleteProfile && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg text-blue-800 text-sm">
          <p>
            <span className="font-medium">Atleta:</span> {athleteProfile.user?.name || 'Nome não disponível'}
            {athleteProfile.weight && <span className="ml-3">Peso: {athleteProfile.weight}kg</span>}
            {athleteProfile.height && <span className="ml-3">Altura: {athleteProfile.height}cm</span>}
          </p>
        </div>
      )}
      
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
                
                {renderNutritionBar()}
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
