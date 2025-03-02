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
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
