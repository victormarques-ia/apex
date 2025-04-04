import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'pt');
  ALTER TABLE "diet_plan_days" ADD COLUMN "repeat_interval_days" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "diet_plan_days" DROP COLUMN IF EXISTS "repeat_interval_days";
  DROP TYPE "public"."_locales";`)
}
