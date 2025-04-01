'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { TrashIcon, PlusIcon } from 'lucide-react';
import { createDietPlanAction, createDietPlanDayAction, deleteDietPlanDayAction } from '@/app/(frontend)/nutrition/actions/diet-plans.action';

interface DietPlanFormProps {
  athleteId: string;
  nutritionistId: string;
  selectedDate: Date;
  dietPlan: any;
  dietPlanDay: any;
  onDietPlanCreated: () => void;
  onDietPlanDayCreated: () => void;
  onDietPlanDayDeleted: () => void;
}

export function DietPlanForm({
  athleteId,
  nutritionistId,
  selectedDate,
  dietPlan,
  dietPlanDay,
  onDietPlanCreated,
  onDietPlanDayCreated,
  onDietPlanDayDeleted
}: DietPlanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState('breakfast');
  const [repeatInterval, setRepeatInterval] = useState(7);
  
  // Format the date for display
  const formattedDate = selectedDate.toISOString().split('T')[0];
  
  // Create a new diet plan if none exists
  const handleCreateDietPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('athleteId', athleteId);
      formData.append('nutritionistId', nutritionistId);
      formData.append('startDate', formattedDate);
      
      const response = await createDietPlanAction(null, formData);
      
      if (response.docs) {
        if (onDietPlanCreated) {
          onDietPlanCreated();
        }
      } else {
        setError(response.message || 'Erro ao criar plano alimentar');
      }
    } catch (err) {
      setError('Erro ao criar plano alimentar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new diet plan day
  const handleCreateDietPlanDay = async () => {
    if (!dietPlan) {
      setError('Nenhum plano alimentar disponível');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('dietPlanId', dietPlan.id);
      formData.append('date', formattedDate);
      formData.append('repeatIntervalDays', repeatInterval.toString());
      
      const response = await createDietPlanDayAction(null, formData);
      
      if (response.docs) {
        if (onDietPlanDayCreated) {
          onDietPlanDayCreated();
        }
      } else {
        setError(response.message || 'Erro ao criar dia do plano alimentar');
      }
    } catch (err) {
      setError('Erro ao criar dia do plano alimentar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a diet plan day
  const handleDeleteDietPlanDay = async () => {
    if (!dietPlanDay) {
      setError('Nenhum dia de plano alimentar selecionado');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('dietPlanDayId', dietPlanDay.id);
      
      const response = await deleteDietPlanDayAction(null, formData);
      
      if (response.docs) {
        if (onDietPlanDayDeleted) {
          onDietPlanDayDeleted();
        }
      } else {
        setError(response.message || 'Erro ao excluir dia do plano alimentar');
      }
    } catch (err) {
      setError('Erro ao excluir dia do plano alimentar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const renderDietPlanDayForm = () => {
    if (dietPlanDay) {
      // Render diet plan day edit form
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Dia do Plano Alimentar</h3>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteDietPlanDay}
              disabled={loading}
            >
              <TrashIcon className="h-4 w-4 mr-1" /> Excluir
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input id="date" value={formattedDate} disabled />
            </div>
            <div>
              <Label htmlFor="repeat_interval">Repetir a cada (dias)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="repeat_interval" 
                  type="number"
                  min="0"
                  max="30"
                  value={repeatInterval}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 30) {
                      setRepeatInterval(value);
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">0 = não repetir, 1-30 = intervalo de repetição</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <h3 className="text-lg font-medium">Refeições</h3>
          
          <Tabs defaultValue="breakfast">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="breakfast" onClick={() => setMealType('breakfast')}>Café da manhã</TabsTrigger>
              <TabsTrigger value="lunch" onClick={() => setMealType('lunch')}>Almoço</TabsTrigger>
              <TabsTrigger value="snack" onClick={() => setMealType('snack')}>Lanche</TabsTrigger>
              <TabsTrigger value="dinner" onClick={() => setMealType('dinner')}>Jantar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakfast">
              <Card>
                <CardHeader>
                  <CardTitle>Café da manhã</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Meal items would be mapped here */}
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">Sem alimentos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <PlusIcon className="h-4 w-4 mr-1" /> Adicionar alimento
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="lunch">
              <Card>
                <CardHeader>
                  <CardTitle>Almoço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Meal items would be mapped here */}
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">Sem alimentos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <PlusIcon className="h-4 w-4 mr-1" /> Adicionar alimento
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="snack">
              <Card>
                <CardHeader>
                  <CardTitle>Lanche</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Meal items would be mapped here */}
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">Sem alimentos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <PlusIcon className="h-4 w-4 mr-1" /> Adicionar alimento
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="dinner">
              <Card>
                <CardHeader>
                  <CardTitle>Jantar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Meal items would be mapped here */}
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">Sem alimentos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <PlusIcon className="h-4 w-4 mr-1" /> Adicionar alimento
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      );
    } else if (dietPlan) {
      // Render create diet plan day form
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Criar Dia do Plano Alimentar</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input id="date" value={formattedDate} disabled />
            </div>
            <div>
              <Label htmlFor="repeat_interval">Repetir a cada (dias)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="repeat_interval" 
                  type="number"
                  min="0"
                  max="30"
                  value={repeatInterval}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 30) {
                      setRepeatInterval(value);
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">0 = não repetir, 1-30 = intervalo de repetição</p>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleCreateDietPlanDay}
            disabled={loading}
          >
            Criar Dia do Plano Alimentar
          </Button>
        </div>
      );
    } else {
      // Render create diet plan form
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Criar Plano Alimentar</h3>
          <p>Não existe um plano alimentar para este atleta. Crie um plano primeiro.</p>
          
          <Button 
            className="w-full" 
            onClick={handleCreateDietPlan}
            disabled={loading}
          >
            Criar Plano Alimentar
          </Button>
        </div>
      );
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Plano Alimentar</CardTitle>
        <p className="text-sm text-muted-foreground">Data: {formattedDate}</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {renderDietPlanDayForm()}
      </CardContent>
    </Card>
  );
}
