import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "exercise_workouts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"workout_plan_id" integer NOT NULL,
  	"exercise_id" integer NOT NULL,
  	"sets" numeric NOT NULL,
  	"reps" numeric NOT NULL,
  	"rest_seconds" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "exercise_workouts_id" integer;
  DO $$ BEGIN
   ALTER TABLE "exercise_workouts" ADD CONSTRAINT "exercise_workouts_workout_plan_id_workout_plans_id_fk" FOREIGN KEY ("workout_plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "exercise_workouts" ADD CONSTRAINT "exercise_workouts_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "exercise_workouts_workout_plan_idx" ON "exercise_workouts" USING btree ("workout_plan_id");
  CREATE INDEX IF NOT EXISTS "exercise_workouts_exercise_idx" ON "exercise_workouts" USING btree ("exercise_id");
  CREATE INDEX IF NOT EXISTS "exercise_workouts_updated_at_idx" ON "exercise_workouts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "exercise_workouts_created_at_idx" ON "exercise_workouts" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exercise_workouts_fk" FOREIGN KEY ("exercise_workouts_id") REFERENCES "public"."exercise_workouts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_exercise_workouts_id_idx" ON "payload_locked_documents_rels" USING btree ("exercise_workouts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "exercise_workouts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "exercise_workouts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_exercise_workouts_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_exercise_workouts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "exercise_workouts_id";`)
}
