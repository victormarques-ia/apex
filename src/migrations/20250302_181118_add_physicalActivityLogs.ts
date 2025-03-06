import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "physical_activity_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"athlete_id" integer NOT NULL,
  	"workout_plan_id" integer,
  	"date" timestamp(3) with time zone NOT NULL,
  	"duration_minutes" numeric NOT NULL,
  	"calories_burned" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "physical_activity_logs_id" integer;
  DO $$ BEGIN
   ALTER TABLE "physical_activity_logs" ADD CONSTRAINT "physical_activity_logs_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "physical_activity_logs" ADD CONSTRAINT "physical_activity_logs_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "physical_activity_logs_athlete_idx" ON "physical_activity_logs" USING btree ("athlete_id");
  CREATE INDEX IF NOT EXISTS "physical_activity_logs_workout_plan_idx" ON "physical_activity_logs" USING btree ("workout_plan_id");
  CREATE INDEX IF NOT EXISTS "physical_activity_logs_updated_at_idx" ON "physical_activity_logs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "physical_activity_logs_created_at_idx" ON "physical_activity_logs" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_physical_activity_logs_fk" FOREIGN KEY ("physical_activity_logs_id") REFERENCES "public"."physical_activity_logs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_physical_activity_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("physical_activity_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "physical_activity_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "physical_activity_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_physical_activity_logs_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_physical_activity_logs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "physical_activity_logs_id";`)
}
