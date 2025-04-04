import { fetchFromApi } from '@/app/utils/fetch-from-api';
import { Endpoint, PayloadRequest } from 'payload'

async function getLoggedInTrainerId(req: PayloadRequest) {
  if (!req.user) {
    throw new Error('Usuário não autenticado');
  }

  const userId = req.user.id;

  const trainerProfiles = await req.payload.find({
    collection: 'trainers',
    where: {
      user: {
        equals: userId,
      },
    },
    limit: 1,
  });

  if (!trainerProfiles.docs || trainerProfiles.docs.length === 0) {
    throw new Error('Perfil de treinador não encontrado para este usuário');
  }

  return trainerProfiles.docs[0].id;
}

export const TrainerApi: Endpoint[] = [
  {
    method: 'get',
    path: '/athletes',
    handler: async (req: PayloadRequest) => {
      try {
        const idTrainer = await getLoggedInTrainerId(req);
        const name = req.query.name as string || "";
        const sortOrder = req.query.sortOrder as string || "asc";
        // Você pode ordenar por nome, data da ultima atualizacao e meta.
        // Exemplo: athlete.user.name, athlete.updatedAt, athlete.goal
        const sortFields = [ 'athlete.user.name', 'athlete.updatedAt', 'athlete.goal' ];
        const sortField = req.query.sortField as number || 0;
        const goal = req.query.goal as string || "";

        // /api/trainer/my-athletes?name=renata
        // teste por ordem ascendente de nome
        // /api/trainer/my-athletes?name=renata&sortOrder=desc
        // teste por ordem ascendente de data de ultima atualizacao
        // /api/trainer/my-athletes?sortOrder=asc&sortField=1
        // teste por ordem ascendente de meta
        // /api/trainer/my-athletes?sortOrder=asc&sortField=2
        // api/trainer/my-athletes?goal=emagrecimento

        const trainerAthletes = await req.payload.find({
          collection: 'trainer-athletes',
          where: {
            and: [
              {
                trainer: {
                  equals: idTrainer,
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
        const athletes = trainerAthletes.docs.map(relation => relation.athlete);

        return Response.json({
          data: {
            total: trainerAthletes.totalDocs,
            athletes: athletes,
          },
        });

      } catch (error) {
        console.error('[TrainerApi][search]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao pesquisar pacientes do treinador' }],
          },
          { status: 500 }
        );
      }
    },
  },
  {
    method: 'get',
    path: '/workout-plans',
    handler: async (req) => {
      try {
        const { athleteId, date, workoutPlanId } = req.query;
        const trainerId = await getLoggedInTrainerId(req);

        // Check if it has a diet plan associated with it
        const workoutPlans = await req.payload.find({
          collection: 'workout-plans',
          where: {
            and: [
              workoutPlanId ? {
                id: {
                  equals: workoutPlanId
                }
              } : {},
              {
                athlete: {
                  equals: athleteId,
                },
              },
              {
                trainer: {
                  equals: trainerId,
                },
              },
              date ? {
                start_date: {
                  less_than_equal: date as string,
                },
              } : {},
              date ? {
                end_date: {
                  greater_than_equal: date as string,
                },
              } : {}
            ],
          },
          depth: 2,
        });

        if (!athleteId) throw new Error('Athlete ID required');

        return Response.json(workoutPlans)

      } catch (error) {
        console.error('[TrainerApi][workout-plans]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar planos de treino.' }]
        }, { status: 500 })
      }
    }
  },
  {
    method: 'get',
    path: '/exercises',
    handler: async (req) => {
      try {
        const { name, muscleGroup } = req.query;
        // list the exercises
        const exercises = await req.payload.find({
          collection: 'exercises',
          where: {
            and: [
              name ? {
                name: {
                  like: name,
                },
              } : {},
              muscleGroup ? {
                muscle_group: {
                  like: muscleGroup,
                },
              } : {}
            ],
          },
          depth: 2,
        });

        return Response.json(exercises)

      } catch (error) {
        console.error('[TrainerApi][exercise]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar exercicios.' }]
        }, { status: 500 })
      }
    }
  },
];
