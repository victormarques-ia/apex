import { Endpoint, PayloadRequest } from 'payload'

async function getLoggedInNutritionistId(req: PayloadRequest) {
    if (!req.user) {
        throw new Error('Usuário não autenticado');
    }

    const userId = req.user.id;

    const nutritionistProfiles = await req.payload.find({
        collection: 'nutritionists',
        where: {
            user: {
                equals: userId,
            },
        },
        limi : 1,
    });

    if (!nutritionistProfiles.docs || nutritionistProfiles.docs.length === 0) {
        throw new Error('Perfil de nutricionista não encontrado para este usuário');
    }

    return nutritionistProfiles.docs[0].id;
}

export const NutritionistApi: Endpoint[] = [
  {
    // listar todos os pacientes daquele nutricionista
    method: 'get',
    path: '/my-athletes',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const name = req.query.name as string || "";
        const sortOrder = req.query.sortOrder as string || "asc";
        // Você pode ordenar por nome, data da ultima atualizacao e meta.
        // Exemplo: athlete.user.name, athlete.updatedAt, athlete.goal
        const sortFields = [ 'athlete.user.name', 'athlete.updatedAt', 'athlete.goal' ];
        const sortField = req.query.sortField as number || 0;
        const goal = req.query.goal as string || "";

        // /api/nutritionists/my-athletes?name=renata
        // teste por ordem ascendente de nome
        // /api/nutritionists/my-athletes?name=renata&sortOrder=desc
        // teste por ordem ascendente de data de ultima atualizacao
        // /api/nutritionists/my-athletes?sortOrder=asc&sortField=1
        // teste por ordem ascendente de meta
        // /api/nutritionists/my-athletes?sortOrder=asc&sortField=2
        // api/nutritionists/my-athletes?goal=emagrecimento

        const nutritionistAthletes = await req.payload.find({
          collection: 'nutritionist-athletes',
          where: {
            and: [
              {
                nutritionist: {
                  equals: nutritionistId,
                }
              },
              ...(name.trim() ? [{
                'athlete.user.name': {
                  like: name,
                }
              }] : []),
              ...(goal.trim() ? [{
                'athlete.goal': {
                  like: goal,
                }
              }] : [])
            ]
          },
          depth: 2,
          sort: sortOrder.toLowerCase() === "desc" ? 
            `-${sortFields[sortField] || sortFields[0]}` : 
            (sortFields[sortField] || sortFields[0]),
          limit: 100,
        });

        // Extrai apenas os perfis de atletas da lista de relacionamentos
        const athletes = nutritionistAthletes.docs.map(relation => relation.athlete);

        return Response.json({
          data: {
            total: nutritionistAthletes.totalDocs,
            athletes: athletes,
          },
        });

      } catch (error) {
        console.error('[NutritionistApi][athletes]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar pacientes do nutricionista' }],
          },
          { status: 500 }
        );
      }
    },
  },
  {
    // escolhendo apenas um paciente para ver mais detalhes sobre
    method: 'get',
    path: '/my-athletes/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const athleteId = req.routeParams?.id;

        const {from, to} = req.query;

        // Fetch the diet-plan
        const Meals = await req.payload.find({
          collection: 'meal',
          where: {
            and: [
              {
                "diet_plan_day.diet_plan.athlete": {
                  equals: athleteId,
                },
              },
              {
                "diet_plan_day.diet_plan.nutritionist": {
                  equals: nutritionistId,
                },
              }
            ],
          },
          depth: 2,
          limit: 50,
        });

        return Response.json({
          data: Meals,
        });
      } catch (error) {
        console.error('[NutritionistApi][athleteById]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar o atleta' }],
          },
          { status: 500 }
        );
      }
    },
  },
  {
    method: 'get',
    path: '/diet-plans',
    handler: async (req) => {
      try {
        const { athleteId, date } = req.query;
        const nutritionistId = await getLoggedInNutritionistId(req);

        // Check if it has a diet plan associated with it
        const dietPlan = await req.payload.find({
          collection: 'diet-plans',
          where: {
            and: [
              {
                athlete: {
                  equals: athleteId,
                },
              },
              {
                nutritionist: {
                  equals: nutritionistId,
                },
              },
            ],
          },
          depth: 2,
        });

        // If no diet plan found, create one
        console.log(String(dietPlan));

        if (!dietPlan.docs || dietPlan.docs.length === 0) {
          console.log('No diet plan found, creating one.')
          const dietPlanData = {
            athlete: parseInt(String(athleteId), 10),
            nutritionist: parseInt(String(nutritionistId), 10),
            start_date: new Date().toDateString(),
            end_date: new Date(
              new Date().setFullYear(new Date().getFullYear() + 20),
            ).toDateString(), // 20 years later
            total_daily_calories: 0,
            notes: null,
          };

          const dietPlan = await req.payload.create({
            collection: 'diet-plans',
            data: dietPlanData,
          })
        } else {
          console.log('Diet plan already exists for this athlete-nutritionist pair')
        }


        if (!athleteId) throw new Error('Athlete ID required');
        
        // Basic query to get all diet plan days for this athlete-nutritionist pair
        const query = {
          and: [
            {
              'diet_plan.athlete.id': { equals: athleteId }
            },
            {
              'diet_plan.nutritionist.id': { equals: nutritionistId }
            }
          ]
        };
        
        // If date is provided, filter for recurring diet plan days
        if (date) {
          let targetDate = new Date(date as string);
          
          // First, get all diet plan days
          const allDays = await req.payload.find({
            collection: 'diet-plan-days',
            where: query,
            depth: 2,
            limit: 100, // Increased to ensure we capture all relevant days
          });
          
          // Filter days that apply to the target date based on repeat interval
          const applicableDays = allDays.docs.filter(day => {
            const dayDate = new Date(day.date);
            
            // If exact date match, always include
            if (dayDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0]) {
              return true;
            }
            
            // If day has repeat interval and is before target date
            if (day.repeat_interval_days && dayDate <= targetDate) {
              // Calculate days between
              const diffTime = targetDate.getTime() - dayDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              
              // Check if target date falls on a repeat cycle
              return diffDays % day.repeat_interval_days === 0;
            }
            
            return false;
          });
          
          // If we found applicable days, return them
          if (applicableDays.length > 0) {
            return Response.json({
              docs: applicableDays,
              totalDocs: applicableDays.length,
              page: 1,
              totalPages: 1,
              limit: applicableDays.length
            });
          }
          
        }
        

        // Fallback: If no days found, find a diet plan that covers the target date
        const dietPlans = await req.payload.find({
          collection: 'diet-plans',
          where: {
            and: [
              { athlete: { equals: athleteId } },
              { nutritionist: { equals: nutritionistId } },
            ]
          },
          sort: '-createdAt', // Most recent first if multiple match
          depth: 2,
          limit: 1
        });

        // Create synthetic response with diet plan but no diet plan day
        return Response.json({
          docs: [{
            id: null,
            diet_plan: dietPlans?.docs[0],
            date: null,
            day_of_week: null,
            repeat_interval_days: null,
            updatedAt: null,
            createdAt: null
          }],
          totalDocs: 1,
          page: 1,
          totalPages: 1,
          limit: 1
        });

      } catch (error) {
        console.error('[NutritionistApi][diet-plans]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar dia do plano alimentar.' }]
        }, { status: 500 })
      }
    }
  },
  {
    method: 'get',
    path: '/meals',
    handler: async (req) => {
      try {
        const { athleteId } = req.query;
        if (!athleteId) throw new Error('Athlete ID required');
  
        const meals = await req.payload.find({
          collection: 'meal',
          where: {
            'diet_plan_day.diet_plan.athlete.id': { equals: athleteId }
          },
          depth: 2
        });
  
        return Response.json(meals);
      } catch (error) {
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar as refeições.' }]
        })
      }
    }
  }
];
