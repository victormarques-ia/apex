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
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import NutritionDashboard from './components/NutritionDashboard';
import { DietTabContent } from '@/components/nutritionist/diet-tab';

// Define the main tabs
const TABS = {
  OVERVIEW: 'overview',
  DIET: 'dieta',
  TRAINING: 'treinos',
  SETTINGS: 'configuracoes'
};

// Types for athlete data
type Athlete = {
  id: string;
  user: {
    id: string;
    name: string;
  };
};

export default function NutritionistOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get active tab and athlete from URL params
  const activeTab = searchParams.get('tab') || TABS.OVERVIEW;
  const athleteId = searchParams.get('athleteId') || '';
  
  // State variables
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athleteId);

  // Fetch the list of athletes assigned to the nutritionist
  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const response = await fetch('/api/nutritionists/my-athletes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch athletes');
        }

        console.log(response);
        
        const data = await response.json();
        setAthletes(data.data.athletes || []);
        
        // If no athlete is selected but we have athletes, auto-select the first one
        if (!selectedAthleteId && data.data.athletes?.length > 0) {
          setSelectedAthleteId(data.data.athletes[0].id);
          updateURLParams(activeTab, data.data.athletes[0].id);
        }
      } catch (error) {
        console.error('Error fetching athletes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, []);

  // Update URL params when tab or athlete changes
  const updateURLParams = (tab: string, athleteId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    params.set('athleteId', athleteId);
    router.push(`?${params.toString()}`);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    updateURLParams(value, selectedAthleteId);
  };

  // Handle athlete selection change
  const handleAthleteChange = (value: string) => {
    setSelectedAthleteId(value);
    updateURLParams(activeTab, value);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <p>Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No athletes state
  if (athletes.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <p>Nenhum atleta encontrado. Adicione atletas para visualizar seus dados.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Painel de Nutricionista</h1>
        
        {/* Athlete selector */}
        <div className="mt-4">
          <Select value={selectedAthleteId} onValueChange={handleAthleteChange}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Selecione um atleta" />
            </SelectTrigger>
            <SelectContent>
              {athletes.map((athlete) => (
                <SelectItem key={athlete.id} value={athlete.id}>
                  {athlete.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value={TABS.OVERVIEW}>Overview</TabsTrigger>
          <TabsTrigger value={TABS.DIET}>Dieta</TabsTrigger>
          <TabsTrigger value={TABS.TRAINING}>Treinos</TabsTrigger>
          <TabsTrigger value={TABS.SETTINGS}>Configurações</TabsTrigger>
        </TabsList>

        {/* Tab contents - will be filled with actual components later */}
        <Card>
          <CardContent className="p-6">
            <TabsContent value={TABS.OVERVIEW} className="mt-0">
              <div className="min-h-[600px]">
                {selectedAthleteId && <NutritionDashboard athleteId={selectedAthleteId} />}
              </div>
            </TabsContent>

            <TabsContent value={TABS.DIET} className="mt-0">
              {selectedAthleteId ? (
                <DietTabContent athleteId={selectedAthleteId} />
              ) : (
                <div className="min-h-[600px] flex items-center justify-center">
                <p>Selecione um atleta para visualizar o plano alimentar</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value={TABS.TRAINING} className="mt-0">
              {/* Training component will be placed here */}
              <div className="min-h-[600px]">
                <h2 className="text-xl font-semibold mb-4">Treinos</h2>
                <p>Conteúdo dos treinos para o atleta selecionado. ID: {selectedAthleteId}</p>
                {/* Training component will be loaded here */}
              </div>
            </TabsContent>

            <TabsContent value={TABS.SETTINGS} className="mt-0">
              {/* Settings component will be placed here */}
              <div className="min-h-[600px]">
                <h2 className="text-xl font-semibold mb-4">Configurações</h2>
                <p>Configurações para o atleta selecionado. ID: {selectedAthleteId}</p>
                {/* Settings component will be loaded here */}
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
