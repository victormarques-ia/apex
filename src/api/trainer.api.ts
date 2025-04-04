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
    path: '/me',
    handler: async (req: PayloadRequest) => {
      try {
        // Check if user is authenticated
        if (!req.user) {
          return Response.json(
            {
              errors: [{ message: 'Usuário não autenticado' }],
            },
            { status: 401 }
          );
        }

        const userId = req.user.id;

        // Find the trainer profile associated with the authenticated user
        const trainer = await req.payload.find({
          collection: 'trainers',
          where: {
            user: {
              equals: userId,
            },
          },
          depth: 2, // Include related fields
        });

        // Check if trainer profile exists
        if (!trainer.docs || trainer.docs.length === 0) {
          return Response.json(
            {
              errors: [{ message: 'Perfil de treinador não encontrado para este usuário' }],
            },
            { status: 404 }
          );
        }

        // Return the first trainer profile found
        return Response.json({
          data: trainer.docs[0],
        });

      } catch (error) {
        console.error('[TrainerApi][me]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar perfil de treinador' }],
          },
          { status: 500 }
        );
      }
    },
  },
  {
    method: 'get',
    path: '/athletes',
    handler: async (req: PayloadRequest) => {
      try {
        const trainer = await fetchFromApi<any>('/api/trainers/me', {
          method: 'GET',
        });
        const idTrainer : number = trainer.data?.data?.user?.id
        if(idTrainer == undefined){
          throw new Error();
        }

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
  }
];
