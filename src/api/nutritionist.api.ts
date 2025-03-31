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
        limit: 1,
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
    //retorna todos os planos alimentares daquele atleta com aquele nutricionista
    method: 'get',
    path: '/diet-plans', 
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const  { athleteId }  = req.query;

        console.log("Id do atleta:" , athleteId);
        console.log("Id do nutri:", nutritionistId);

        if (!athleteId) {
          return Response.json(
            {
            errors: [{ message: 'Id do atleta é necessário' }]
            },
            { status: 400}
        );
        }

        const dietPlans = await req.payload.find({
          collection: 'diet-plans',
          where: {
            'nutritionist': {
              equals: nutritionistId,
            },
            'athlete.id': {
              equals: athleteId,
            }
          },
          sort: '-startDate',
          depth: 1,
        });

        console.log("Planos alimentares: ", dietPlans);

        return Response.json({
          data: {
            total: dietPlans.totalDocs,
            dietPlans: dietPlans.docs,
          }
        });

      } catch (error) {
        console.error('[NutritionistApi][dietPlans]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar plano alimentar.' }]
        })
      }
    },
  },
  {
    method: 'get',
    path: '/diet-plan-days',
    handler: async (req) => {
      try {
        const { athleteId } = req.query;
        if (!athleteId) throw new Error('Athlete ID required');
  
        const days = await req.payload.find({
          collection: 'diet-plan-days',
          where: {
            'diet_plan.athlete.id': { equals: athleteId }
          },
          depth: 1
        });
  
        return Response.json(days);
      } catch (error) {
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar dia do plano alimentar.' }]
        })
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