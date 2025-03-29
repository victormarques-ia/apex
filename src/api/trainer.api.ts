import { fetchFromApi } from '@/app/utils/fetch-from-api';
import { Endpoint, PayloadRequest } from 'payload'

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
        
        let nameQuery = req.query.name as string | undefined;
        let genderQuery = req.query.gender as string | undefined;
        
        nameQuery = nameQuery != undefined ? nameQuery.toLowerCase() : undefined;
        genderQuery = genderQuery != undefined ? genderQuery.toLowerCase() : undefined;
        
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
        const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
        
        // Validate limit parameter
        const validLimit = isNaN(limit) || limit < 1 || limit > 100 ? 10 : limit;

        // Search for athletes that match the query
        const trainerAthletResults = await req.payload.find({
          collection: 'trainer-athletes',
          where: {
            trainer: {
              equals: idTrainer,
            },
          },
          limit: validLimit,
          page, // PayloadCMS handles pagination
          sort: 'trainer', // Sort by trainer
        });

        let athletes: any[] = trainerAthletResults.docs.map(e => e.athlete);
        
        athletes = athletes.filter(e => {
          if(nameQuery && !(e.user.name as string).toLowerCase().includes(nameQuery)) return false;
          if(genderQuery && !(e.gender as string).toLowerCase().includes(genderQuery)) return false;
          return true;
        });
        
        return Response.json(athletes);

      } catch (error) {
        console.error('[FoodApi][search]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao pesquisar alimentos' }],
          },
          { status: 500 }
        );
      }
    },
  }
];
