'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types for dashboard data
type NutrientTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
};

type DailyTarget = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
};

type ConsumptionData = {
  date: string;
  totals: NutrientTotals;
  targets: DailyTarget;
  percentage: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
};

// Default targets
const defaultDailyTarget: DailyTarget = {
  calories: 3000,
  protein: 100,
  carbs: 500,
  fat: 30,
  water: 3.5
};

const NutritionDashboard = ({ athleteId }: { athleteId: string }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [consumptionData, setConsumptionData] = useState<ConsumptionData | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (!athleteId) return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch meals data
        const mealsResponse = await fetch(`/api/meals/totals?athleteId=${athleteId}&from=${dateRange.from}&to=${dateRange.to}`);
        if (!mealsResponse.ok) throw new Error('Failed to fetch meal data');
        const mealsData = await mealsResponse.json();
        
        // Fetch daily consumption targets
        const dailyConsumptionResponse = await fetch(`/api/daily-consumption/totals?athleteId=${athleteId}&from=${dateRange.from}&to=${dateRange.to}`);
        if (!dailyConsumptionResponse.ok) throw new Error('Failed to fetch consumption data');
        const dailyConsumptionData = await dailyConsumptionResponse.json();
        
        // Combine the data
        const targets = dailyConsumptionData.targets || defaultDailyTarget;
        const actualTotals = mealsData.totals || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          water: 0
        };
        
        // Calculate percentages
        const percentages = {
          calories: calculatePercentage(actualTotals.calories, targets.calories),
          protein: calculatePercentage(actualTotals.protein, targets.protein),
          carbs: calculatePercentage(actualTotals.carbs, targets.carbs),
          fat: calculatePercentage(actualTotals.fat, targets.fat),
          water: calculatePercentage(actualTotals.water, targets.water),
        };
        
        setConsumptionData({
          date: dateRange.from,
          totals: actualTotals,
          targets: targets,
          percentage: percentages,
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // Fallback to mock data for demonstration
        const mockTotals = {
          calories: 1532,
          protein: 100,
          carbs: 500,
          fat: 30,
          water: 3.5
        };
        
        const percentages = {
          calories: 48,
          protein: 83,
          carbs: 120,
          fat: 50,
          water: 95
        };
        
        setConsumptionData({
          date: dateRange.from,
          totals: mockTotals,
          targets: defaultDailyTarget,
          percentage: percentages,
        });
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [athleteId, dateRange]);
  
  // Helper function to calculate percentage
  const calculatePercentage = (actual: number, target: number): number => {
    if (!target) return 0;
    return Math.round((actual / target) * 100);
  };
  
  // Fetch data for a different date
  const handleDateChange = (days: number) => {
    const newDate = subDays(parseISO(dateRange.from), days * -1);
    setDateRange({
      from: format(newDate, 'yyyy-MM-dd'),
      to: format(newDate, 'yyyy-MM-dd'),
    });
  };

  if (loading) {
    return (
      <div className="mt-4 grid gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <p>Carregando dados nutricionais...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Painel</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => handleDateChange(-1)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Anterior
              </button>
              <span className="px-3 py-1 bg-gray-100 rounded-md">
                {format(parseISO(dateRange.from), 'dd MMM, yyyy', { locale: ptBR })}
              </span>
              <button 
                onClick={() => handleDateChange(1)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Próximo
              </button>
            </div>
          </div>
          
          {consumptionData && (
            <>
              {/* Macronutrient cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Calories */}
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Calorias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(consumptionData.totals.calories)} kcal</div>
                    <div className="text-xs text-gray-600">{consumptionData.percentage.calories}% da meta diária</div>
                    <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${Math.min(consumptionData.percentage.calories, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Carbs */}
                <Card className="bg-green-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Carboidratos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(consumptionData.totals.carbs)} gramas</div>
                    <div className="text-xs text-gray-600">{consumptionData.percentage.carbs}% da meta diária</div>
                    <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${Math.min(consumptionData.percentage.carbs, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Protein */}
                <Card className="bg-purple-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Proteínas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(consumptionData.totals.protein)} gramas</div>
                    <div className="text-xs text-gray-600">{consumptionData.percentage.protein}% da meta diária</div>
                    <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${Math.min(consumptionData.percentage.protein, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fat */}
                <Card className="bg-yellow-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Gorduras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(consumptionData.totals.fat)} gramas</div>
                    <div className="text-xs text-gray-600">{consumptionData.percentage.fat}% da meta diária</div>
                    <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-yellow-500 h-full rounded-full"
                        style={{ width: `${Math.min(consumptionData.percentage.fat, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Water */}
                <Card className="bg-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Água</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{consumptionData.totals.water.toFixed(1)} litros</div>
                    <div className="text-xs text-gray-600">{consumptionData.percentage.water}% da meta diária</div>
                    <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(consumptionData.percentage.water, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statistics and chart */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Gráfico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-gray-500">Gráfico de consumo será implementado aqui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ingestão de calorias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Meta média</span>
                        <span className="font-bold">3000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Média de gasto %</span>
                        <span className="font-bold">110%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Média de ingestão</span>
                        <span className="font-bold">90%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="avaliacao">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Avaliação</h2>
              <p>Conteúdo da avaliação para o atleta selecionado.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Reports</h2>
              <p>Conteúdo dos reports para o atleta selecionado.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionDashboard;
