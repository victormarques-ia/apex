import { Endpoint, PayloadRequest } from 'payload'

export const AthleteApi: Endpoint[] = [
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

        // Find the athlete profile associated with the authenticated user
        const athleteProfiles = await req.payload.find({
          collection: 'athlete-profiles',
          where: {
            user: {
              equals: userId,
            },
          },
          depth: 2, // Include related fields
        });

        // Check if athlete profile exists
        if (!athleteProfiles.docs || athleteProfiles.docs.length === 0) {
          return Response.json(
            {
              errors: [{ message: 'Perfil de atleta não encontrado para este usuário' }],
            },
            { status: 404 }
          );
        }

        // Return the first athlete profile found
        return Response.json({
          data: athleteProfiles.docs[0],
        });

      } catch (error) {
        console.error('[AthleteApi][me]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar perfil de atleta' }],
          },
          { status: 500 }
        );
      }
    },
  },
];
