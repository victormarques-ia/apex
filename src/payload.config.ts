// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { en } from '@payloadcms/translations/languages/en'
import { pt } from '@payloadcms/translations/languages/pt'

import { Users } from './collections/Users'
import { Trainers } from './collections/Trainers'
import { Media } from './collections/Media'
import { Agencies } from './collections/Agencies'
import { Nutritionists } from './collections/Nutritionists'
import { AthleteProfiles } from './collections/AthleteProfiles'
import { WorkoutPlans } from './collections/WorkoutPlans'
import { TrainerAthletes } from './collections/TrainerAthletes'
import { PhysicalActivityLog } from './collections/PhysicalActivityLogs'
import { Exercises } from './collections/Exercises'
import { ExerciseWorkouts } from './collections/ExerciseWorkouts'
import { DietPlans } from './collections/DietPlans'
import { DietPlanDays } from './collections/DietPlanDays'
import { Meal } from './collections/Meal'
import { Food } from './collections/Food'
import { MealFood } from './collections/MealFood'
import { DailyConsumption } from './collections/DailyConsumption'
import { HydrationLog } from './collections/HydrationLog'
import { Report } from './collections/Report'
import { NutritionistAthlete } from './collections/NutritionistAthlete'
import { Feedback } from './collections/Feedback'
import { AgencyProfessional } from './collections/AgencyProfessional'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Trainers,
    Agencies,
    Nutritionists,
    AthleteProfiles,
    WorkoutPlans,
    TrainerAthletes,
    PhysicalActivityLog,
    Exercises,
    ExerciseWorkouts,
    DietPlans,
    DietPlanDays,
    Meal,
    Food,
    MealFood,
    DailyConsumption,
    HydrationLog,
    Report,
    NutritionistAthlete,
    Feedback,
    AgencyProfessional
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  i18n: {
    supportedLanguages: { en, pt },
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
