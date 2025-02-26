import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('athlete', 'nutritionist', 'trainer', 'agency');
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" NOT NULL;
  ALTER TABLE "users" ADD COLUMN "name" varchar NOT NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "name";
  DROP TYPE "public"."enum_users_role";`)
}
