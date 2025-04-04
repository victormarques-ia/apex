import { Endpoint, PayloadRequest } from 'payload'

export const FoodApi: Endpoint[] = [
  {
    method: 'get',
    path: '/search',
    handler: async (req: PayloadRequest) => {
      try {
        const query = req.query.q as string;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
        const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
        
        // Validate limit parameter
        const validLimit = isNaN(limit) || limit < 1 || limit > 100 ? 10 : limit;

        // Search for foods that match the query
        const foodResults = await req.payload.find({
          collection: 'food',
          where: {
            name: {
              like: query,
            },
          },
          limit: validLimit,
          page: page ? parseInt(page as unknown as string, 10) : undefined, // PayloadCMS handles pagination
          sort: 'name', // Sort by name
        });

        return Response.json(foodResults);

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
  },
];
