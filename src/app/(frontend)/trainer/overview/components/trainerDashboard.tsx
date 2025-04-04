/*
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
  * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
*/
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


const TrainerDashboard = ({ athleteId }: { athleteId: string }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [totalActivityTime, setTotalActivityTime] = useState<number>(0);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    // Get current week's Monday and Sunday
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? 6 : currentDay - 1; // Adjust for Sunday (0)
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - diff);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      from: format(monday, 'yyyy-MM-dd'),
      to: format(sunday, 'yyyy-MM-dd'),
      startDate: monday,
      endDate: sunday
    };
  });

  useEffect(() => {
    if (!athleteId) return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Track successful API calls
        let mealDataSuccess = false;
        
        let totalCaloriasBurned = 0;
        let totalActivityTime = 0;

        // Default data structures
        let mealsData = {
          grandTotal: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            water: 0
          }
        };
        
        // Fetch physical activity log data
        try {
          const activityResponse = await fetch(`/api/physical-activity-logs`);

          if (activityResponse.ok) {
            const responseData = await activityResponse.json();
            for(const activity of responseData.docs) {
                if(activity.athlete.id === athleteId) {
                    totalCaloriasBurned += activity.calories_burned || 0;
                    totalActivityTime += activity.duration_minutes || 0;
                }
            }
            console.log('pao', responseData);
            mealsData = responseData;
            mealDataSuccess = true;
          } else {
            console.error('activity API returned error:', activityResponse.status);
          }
        } catch (mealError) {
          console.error('Error fetching activity data:', mealError);
        }
        
        
        
        setCaloriesBurned(totalCaloriasBurned);
        setTotalActivityTime(totalActivityTime);
          
      } catch (err) {
        console.error('Unexpected error in dashboard component:', err);
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [athleteId, dateRange]);
  
  // Fetch data for a different week
  const handleDateChange = (weeks: number) => {
    // Calculate new dates by shifting weeks
    const newStartDate = new Date(dateRange.startDate);
    newStartDate.setDate(newStartDate.getDate() + (weeks * 7));
    
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + 6);
    
    setDateRange({
      from: format(newStartDate, 'yyyy-MM-dd'),
      to: format(newEndDate, 'yyyy-MM-dd'),
      startDate: newStartDate,
      endDate: newEndDate
    });
  };

  if (loading) {
    return (
      <div className="mt-4 grid gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <p>Carregando dados...</p>
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
                Semana Anterior
              </button>
              <span className="px-4 py-1 bg-gray-100 rounded-md">
                {format(dateRange.startDate, 'dd MMM', { locale: ptBR })} - {format(dateRange.endDate, 'dd MMM, yyyy', { locale: ptBR })}
              </span>
              <button 
                onClick={() => handleDateChange(1)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Próxima Semana
              </button>
            </div>
          </div>
          
          
            <>
              {/* Macronutrient cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Calorias Queimadas */}
                <Card className="bg-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Calorias Queimadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(caloriesBurned)} kcal</div>
                    <div className="text-xs text-gray-600">{53}% da meta diária</div>
                    <div className="w-full bg-gray-200 h-2 mt-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${Math.min(53, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tempo de treino */}
                <Card className="bg-green-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tempo de treino</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(totalActivityTime)} min</div>
                  </CardContent>
                </Card>

                {/* Sets */}
                <Card className="bg-purple-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(10)}</div>
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

                {/* TODO: PEGAR DADOS AO INVES DE MOCKAR */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Distância Semanal</span>
                        <span className="font-bold">39km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo de exercício</span>
                        <span className="font-bold">4h 20m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )
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

export default TrainerDashboard;
