import { Endpoint, PayloadRequest } from 'payload'

async function getLoggedInAgency(req: PayloadRequest) {
  // Check if user is authenticated
  if (!req.user) {
    return Response.json(
      {
        errors: [{ message: 'Usuário não autenticado' }],
      },
      { status: 401 },
    )
  }

  const authenticatedUserId = req.user.id

  // Find the agency profile associated with the authenticated user
  const agencyProfiles = await req.payload.find({
    collection: 'agencies',
    where: {
      user: {
        equals: authenticatedUserId,
      },
    },
    depth: 2, // Include related fields
  })

  // Check if agency profile exists
  if (!agencyProfiles.docs || agencyProfiles.docs.length === 0) {
    return Response.json(
      {
        errors: [{ message: 'Perfil de agência não encontrado para este usuário' }],
      },
      { status: 404 },
    )
  }

  return agencyProfiles.docs[0]
}

export const AgencyApi: Endpoint[] = [
  {
    method: 'get',
    path: '/me',
    handler: async (req: PayloadRequest) => {
      try {
        const result = await getLoggedInAgency(req)

        // Check if result is a Response object (which would contain errors)
        if (result instanceof Response) {
          return result
        }

        // Otherwise, return the result inside data
        return Response.json({
          data: result,
        })
      } catch (error) {
        console.error('[AgencyApi][me]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar perfil de agência' }],
          },
          { status: 500 },
        )
      }
    },
  },
  {
    method: 'post',
    path: '/register-athlete',
    handler: async (req: PayloadRequest) => {
      try {
        // Authentication and authorization checks
        console.log('Registering athlete - request by user:', req.user?.id)
        if (!req.user) {
          return Response.json(
            { errors: [{ message: 'Usuário não autenticado' }] },
            { status: 401 },
          )
        }

        // Verify the user is an agency
        const userResult = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
        })

        if (!userResult || userResult.role !== 'agency') {
          return Response.json(
            { errors: [{ message: 'Apenas agências podem registrar atletas' }] },
            { status: 403 },
          )
        }

        // Find the agency profile
        const agencyProfiles = await req.payload.find({
          collection: 'agencies',
          where: { user: { equals: req.user.id } },
        })

        if (!agencyProfiles.docs || agencyProfiles.docs.length === 0) {
          return Response.json(
            { errors: [{ message: 'Perfil de agência não encontrado' }] },
            { status: 404 },
          )
        }

        // Get the agency ID
        const agencyId = agencyProfiles.docs[0].id
        console.log('Using agency ID:', agencyId)

        // Parse request body
        const data = await req.json?.()
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 },
          )
        }

        // Validate required fields
        if (!data.userId) {
          return Response.json(
            { errors: [{ message: 'ID do usuário é obrigatório' }] },
            { status: 400 },
          )
        }

        const userId = parseInt(String(data.userId), 10)
        console.log('Attempting to create athlete profile for user ID:', userId)

        // IMPORTANT: Check if this user already has an athlete profile
        const existingAthleteProfiles = await req.payload.find({
          collection: 'athlete-profiles',
          where: { user: { equals: userId } },
        })

        if (existingAthleteProfiles.docs && existingAthleteProfiles.docs.length > 0) {
          console.log('User already has an athlete profile:', existingAthleteProfiles.docs[0].id)
          return Response.json(
            {
              errors: [{ message: 'Este usuário já possui um perfil de atleta cadastrado' }],
            },
            { status: 409 }, // Conflict status code
          )
        }

        // Create athlete profile only if no existing profile was found
        const athleteProfileData = {
          agency: agencyId,
          user: userId,
          weight: data.weight ? parseFloat(String(data.weight)) : null,
          height: data.height ? parseFloat(String(data.height)) : null,
          birth_date: data.birthDate || null,
          gender: data.gender || null,
          dietary_habits: data.nutritionalHabits || null,
          physical_activity_habits: data.physicalActivityHabits || null,
          goal: data.objectives || null,
        }

        const athleteProfile = await req.payload.create({
          collection: 'athlete-profiles',
          data: athleteProfileData,
        })

        console.log('Created athlete profile with ID:', athleteProfile.id)

        // Handle relationships (trainer and nutritionist)
        let trainerRelationship = false
        let nutritionistRelationship = false

        if (data.trainerEmail) {
          try {
            // Find trainer user
            const trainerUserResult = await req.payload.find({
              collection: 'users',
              where: { email: { equals: data.trainerEmail } },
            })

            if (trainerUserResult.docs?.length > 0) {
              const trainerUserId = trainerUserResult.docs[0].id

              // Find trainer profile
              const trainerResult = await req.payload.find({
                collection: 'trainers',
                where: { user: { equals: trainerUserId } },
              })

              if (trainerResult.docs?.length > 0) {
                const trainerId = trainerResult.docs[0].id

                // Check if trainer is part of the agency
                const agencyProfResult = await req.payload.find({
                  collection: 'agency-professionals',
                  where: {
                    and: [
                      { professional: { equals: trainerUserId } },
                      { agency: { equals: agencyId } },
                    ],
                  },
                })

                if (agencyProfResult.docs?.length > 0) {
                  // Create trainer-athlete relationship
                  await req.payload.create({
                    collection: 'trainer-athletes',
                    data: {
                      trainer: trainerId,
                      athlete: athleteProfile.id,
                    },
                  })
                  trainerRelationship = true
                  console.log('Created trainer relationship')
                }
              }
            }
          } catch (error) {
            console.error('Error creating trainer-athlete relationship:', error)
          }
        }

        // Handle nutritionist relationship
        if (data.nutritionistEmail) {
          try {
            // Find nutritionist user
            const nutritionistUserResult = await req.payload.find({
              collection: 'users',
              where: { email: { equals: data.nutritionistEmail } },
            })

            if (nutritionistUserResult.docs?.length > 0) {
              const nutritionistUserId = nutritionistUserResult.docs[0].id

              // Find nutritionist profile
              const nutritionistResult = await req.payload.find({
                collection: 'nutritionists',
                where: { user: { equals: nutritionistUserId } },
              })

              if (nutritionistResult.docs?.length > 0) {
                const nutritionistId = nutritionistResult.docs[0].id

                // Check if nutritionist is part of the agency
                const agencyProfResult = await req.payload.find({
                  collection: 'agency-professionals',
                  where: {
                    and: [
                      { professional: { equals: nutritionistUserId } },
                      { agency: { equals: agencyId } },
                    ],
                  },
                })

                if (agencyProfResult.docs?.length > 0) {
                  // Create nutritionist-athlete relationship
                  await req.payload.create({
                    collection: 'nutritionist-athletes',
                    data: {
                      nutritionist: nutritionistId,
                      athlete: athleteProfile.id,
                    },
                  })
                  nutritionistRelationship = true
                  console.log('Created nutritionist relationship')
                }
              }
            }
          } catch (error) {
            console.error('Error creating nutritionist-athlete relationship:', error)
          }
        }

        // Return response with profile and relationships
        return Response.json({
          data: {
            profile: athleteProfile,
            trainerRelationship,
            nutritionistRelationship,
          },
        })
      } catch (error) {
        console.error('[AgencyApi][register-athlete]:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Erro inesperado ao registrar atleta'
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 })
      }
    },
  },
  {
    method: 'post',
    path: '/register-nutritionist',
    handler: async (req: PayloadRequest) => {
      try {
        // Authentication and authorization checks
        console.log('Registering nutritionist - request by user:', req.user?.id)
        if (!req.user) {
          return Response.json(
            { errors: [{ message: 'Usuário não autenticado' }] },
            { status: 401 },
          )
        }

        // Verify the user is an agency
        const userResult = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
        })

        if (!userResult || userResult.role !== 'agency') {
          return Response.json(
            { errors: [{ message: 'Apenas agências podem registrar nutricionistas' }] },
            { status: 403 },
          )
        }

        // Find the agency profile
        const agencyProfiles = await req.payload.find({
          collection: 'agencies',
          where: { user: { equals: req.user.id } },
        })

        if (!agencyProfiles.docs || agencyProfiles.docs.length === 0) {
          return Response.json(
            { errors: [{ message: 'Perfil de agência não encontrado' }] },
            { status: 404 },
          )
        }

        // Get the agency ID
        const agencyId = agencyProfiles.docs[0].id
        console.log('Using agency ID:', agencyId)

        // Parse request body
        const data = await req.json?.()
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 },
          )
        }

        // Validate required fields
        if (!data.userId) {
          return Response.json(
            { errors: [{ message: 'ID do usuário é obrigatório' }] },
            { status: 400 },
          )
        }

        const userId = parseInt(String(data.userId), 10)
        console.log('Attempting to create nutritionist profile for user ID:', userId)

        // IMPORTANT: Check if this user already has an nutritionist profile
        const existingNutritionistProfiles = await req.payload.find({
          collection: 'nutritionists',
          where: { user: { equals: userId } },
        })

        if (existingNutritionistProfiles.docs && existingNutritionistProfiles.docs.length > 0) {
          console.log(
            'User already has an nutritionist profile:',
            existingNutritionistProfiles.docs[0].id,
          )
          return Response.json(
            {
              errors: [{ message: 'Este usuário já possui um perfil de nutricionista cadastrado' }],
            },
            { status: 409 }, // Conflict status code
          )
        }

        // Create nutritionist profile only if no existing profile was found
        const nutritionistData = {
          agency: agencyId,
          user: userId,
          license_number: data.license_number || null,
          specialization: data.specialization || null,
        }

        const nutritionistProfile = await req.payload.create({
          collection: 'nutritionists',
          data: nutritionistData,
        })

        // Create agency-professional relationship
        await req.payload.create({
          collection: 'agency-professionals',
          data: {
            agency: agencyId,
            professional: userId,
            role: 'nutritionist',
          },
        })
        console.log('Created agency relationship')

        console.log('Created nutritionist profile with ID:', nutritionistProfile.id)

        // Return response with profile and relationships
        return Response.json({
          data: {
            profile: nutritionistProfile,
          },
        })
      } catch (error) {
        console.error('[AgencyApi][register-nutritionist]:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Erro inesperado ao registrar nutricionista'
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 })
      }
    },
  },
  {
    method: 'post',
    path: '/register-trainer',
    handler: async (req: PayloadRequest) => {
      try {
        // Authentication and authorization checks
        console.log('Registering trainer - request by user:', req.user?.id)
        if (!req.user) {
          return Response.json(
            { errors: [{ message: 'Usuário não autenticado' }] },
            { status: 401 },
          )
        }

        // Verify the user is an agency
        const userResult = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
        })

        if (!userResult || userResult.role !== 'agency') {
          return Response.json(
            { errors: [{ message: 'Apenas agências podem registrar treinadors' }] },
            { status: 403 },
          )
        }

        // Find the agency profile
        const agencyProfiles = await req.payload.find({
          collection: 'agencies',
          where: { user: { equals: req.user.id } },
        })

        if (!agencyProfiles.docs || agencyProfiles.docs.length === 0) {
          return Response.json(
            { errors: [{ message: 'Perfil de agência não encontrado' }] },
            { status: 404 },
          )
        }

        // Get the agency ID
        const agencyId = agencyProfiles.docs[0].id
        console.log('Using agency ID:', agencyId)

        // Parse request body
        const data = await req.json?.()
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 },
          )
        }

        // Validate required fields
        if (!data.userId) {
          return Response.json(
            { errors: [{ message: 'ID do usuário é obrigatório' }] },
            { status: 400 },
          )
        }

        const userId = parseInt(String(data.userId), 10)
        console.log('Attempting to create trainer profile for user ID:', userId)

        // IMPORTANT: Check if this user already has an trainer profile
        const existingTrainerProfiles = await req.payload.find({
          collection: 'trainers',
          where: { user: { equals: userId } },
        })

        if (existingTrainerProfiles.docs && existingTrainerProfiles.docs.length > 0) {
          console.log('User already has an trainer profile:', existingTrainerProfiles.docs[0].id)
          return Response.json(
            {
              errors: [{ message: 'Este usuário já possui um perfil de treinador cadastrado' }],
            },
            { status: 409 }, // Conflict status code
          )
        }

        // Create trainer profile only if no existing profile was found
        const trainerData = {
          agency: agencyId,
          user: userId,
          license_number: data.license_number || null,
          specialization: data.specialization || null,
        }

        const trainerProfile = await req.payload.create({
          collection: 'trainers',
          data: trainerData,
        })

        // Create agency-professional relationship
        await req.payload.create({
          collection: 'agency-professionals',
          data: {
            agency: agencyId,
            professional: userId,
            role: 'trainer',
          },
        })
        console.log('Created agency relationship')

        console.log('Created trainer profile with ID:', trainerProfile.id)

        // Return response with profile and relationships
        return Response.json({
          data: {
            profile: trainerProfile,
          },
        })
      } catch (error) {
        console.error('[AgencyApi][register-trainer]:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Erro inesperado ao registrar treinador'
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 })
      }
    },
  },
  {
    method: 'get',
    path: '/my-nutritionists',
    handler: async (req: PayloadRequest) => {
      try {
        const response = await getLoggedInAgency(req)
        if (response instanceof Response) {
          return response
        }
        const agencyId = response.id
        const name = (req.query.name as string) || ''
        const sortOrder = (req.query.sortOrder as string) || 'asc'
        // Você pode ordenar por nome, data da ultima atualizacao e meta.
        // Exemplo: user.name, updatedAt, specialization
        const sortFields = ['user.name', 'createdAt', 'specialization']
        const sortField = (req.query.sortField as number) || 0
        const specialization = (req.query.specialization as string) || ''

        const agenciesNutritionists = await req.payload.find({
          collection: 'agency-professionals',
          where: {
            and: [
              {
                agency: {
                  equals: agencyId,
                },
              },
              {
                role: {
                  equals: 'nutritionist',
                },
              },
              ...(name.trim()
                ? [
                    {
                      'professional.name': {
                        like: name,
                      },
                    },
                  ]
                : []),
            ],
          },
          depth: 2,
          sort:
            sortOrder.toLowerCase() === 'desc'
              ? `-${sortFields[sortField] || sortFields[0]}`
              : sortFields[sortField] || sortFields[0],
          limit: 100,
        })

        const professionals = agenciesNutritionists.docs.map((relation) => relation.professional)

        console.log('professionals', professionals)

        const nutritionists = await req.payload.find({
          collection: 'nutritionists',
          where: {
            and: [
              {
                user: {
                  in: professionals.map((professional) => typeof professional === 'object' && 'id' in professional ? professional.id : professional),
                },
              },
              ...(specialization.trim()
                ? [
                    {
                      specialization: {
                        like: specialization,
                      },
                    },
                  ]
                : []),
            ],
          },
          depth: 2,
          sort:
            sortOrder.toLowerCase() === 'desc'
              ? `-${sortFields[sortField] || sortFields[0]}`
              : sortFields[sortField] || sortFields[0],
          limit: 100,
        })
        if (professionals.length === 0) {
          return Response.json({
            data: {
              total: 0,
              nutritionists: [],
            },
          })
        }

        return Response.json({
          data: {
            total: nutritionists.totalDocs,
            nutritionists: nutritionists.docs,
          },
        })
      } catch (error) {
        console.log('[AgencyApi][nutritionists]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar nutricionista' }],
          },
          { status: 500 },
        )
      }
    },
  },
  {
    method: 'get',
    path: '/my-trainers',
    handler: async (req: PayloadRequest) => {
      try {
        const response = await getLoggedInAgency(req)
        if (response instanceof Response) {
          return response
        }
        const agencyId = response.id
        const name = (req.query.name as string) || ''
        const sortOrder = (req.query.sortOrder as string) || 'asc'
        // Você pode ordenar por nome, data da ultima atualizacao e meta.
        // Exemplo: user.name, updatedAt, specialization
        const sortFields = ['user.name', 'createdAt', 'specialization']
        const sortField = (req.query.sortField as number) || 0
        const specialization = (req.query.specialization as string) || ''

        const agenciesNutritionists = await req.payload.find({
          collection: 'agency-professionals',
          where: {
            and: [
              {
                agency: {
                  equals: agencyId,
                },
              },
              {
                role: {
                  equals: 'trainer',
                },
              },
              ...(name.trim()
                ? [
                    {
                      'professional.name': {
                        like: name,
                      },
                    },
                  ]
                : []),
            ],
          },
          depth: 2,
          sort:
            sortOrder.toLowerCase() === 'desc'
              ? `-${sortFields[sortField] || sortFields[0]}`
              : sortFields[sortField] || sortFields[0],
          limit: 100,
        })

        const professionals = agenciesNutritionists.docs.map((relation) => relation.professional)

        const trainers = await req.payload.find({
          collection: 'trainers',
          where: {
            and: [
              {
                user: {
                  in: professionals.map((professional) => typeof professional === 'object' && 'id' in professional ? professional.id : professional),
                },
              },
              ...(specialization.trim()
                ? [
                    {
                      specialization: {
                        like: specialization,
                      },
                    },
                  ]
                : []),
            ],
          },
          depth: 2,
          sort:
            sortOrder.toLowerCase() === 'desc'
              ? `-${sortFields[sortField] || sortFields[0]}`
              : sortFields[sortField] || sortFields[0],
          limit: 100,
        })
        if (professionals.length === 0) {
          return Response.json({
            data: {
              total: 0,
              trainers: [],
            },
          })
        }

        console.log('[Trainers]', trainers.docs)

        return Response.json({
          data: {
            total: trainers.totalDocs,
            trainers: trainers.docs,
          },
        })
      } catch (error) {
        console.log('[AgencyApi][Trainers]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar treinadores' }],
          },
          { status: 500 },
        )
      }
    },
  },
  {
    method: 'get',
    path: '/my-athletes',
    handler: async (req: PayloadRequest) => {
      try {
        const response = await getLoggedInAgency(req)
        if (response instanceof Response) {
          return response
        }
        const agencyId = response.id
        const name = (req.query.name as string) || ''
        const sortOrder = (req.query.sortOrder as string) || 'asc'
        // Você pode ordenar por nome, data da ultima atualizacao e meta.
        // Exemplo: user.name, createdAt, gender
        const sortFields = ['user.name', 'createdAt', 'gender']
        const sortField = (req.query.sortField as number) || 0
        const gender = (req.query.gender as string) || ''

        const athletesProfiles = await req.payload.find({
          collection: 'athlete-profiles',
          where: {
            and: [
              {
                agency: {
                  equals: agencyId,
                },
              },
              ...(name.trim()
                ? [
                    {
                      'user.name': {
                        like: name,
                      },
                    },
                  ]
                : []),
              ...(gender.trim()
                ? [
                    {
                      gender: {
                        like: gender,
                      },
                    },
                  ]
                : []),
            ],
          },
          depth: 2,
          sort:
            sortOrder.toLowerCase() === 'desc'
              ? `-${sortFields[sortField] || sortFields[0]}`
              : sortFields[sortField] || sortFields[0],
          limit: 100,
        })

        const athletes = athletesProfiles.docs

        if (athletes.length === 0) {
          return Response.json({
            data: {
              total: 0,
              athletes: [],
            },
          })
        }

        return Response.json({
          data: {
            total: athletesProfiles.totalDocs,
            athletes: athletes,
          },
        })
      } catch (error) {
        console.log('[AgencyApi][Athletes]:', error)
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar atletas' }],
          },
          { status: 500 },
        )
      }
    },
  },
]
