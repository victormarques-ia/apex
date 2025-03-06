import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "workout_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"athlete_id" integer,
  	"trainer_id" integer,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"goal" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "workout_plans_id" integer;
  DO $$ BEGIN
   ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "workout_plans_athlete_idx" ON "workout_plans" USING btree ("athlete_id");
  CREATE INDEX IF NOT EXISTS "workout_plans_trainer_idx" ON "workout_plans" USING btree ("trainer_id");
  CREATE INDEX IF NOT EXISTS "workout_plans_updated_at_idx" ON "workout_plans" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "workout_plans_created_at_idx" ON "workout_plans" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workout_plans_fk" FOREIGN KEY ("workout_plans_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_workout_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("workout_plans_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "workout_plans" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "workout_plans" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_workout_plans_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_workout_plans_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "workout_plans_id";`)
}
