import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "hydration_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"athlete_id" integer,
  	"date" timestamp(3) with time zone NOT NULL,
  	"amount_ml" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hydration_log_id" integer;
  DO $$ BEGIN
   ALTER TABLE "hydration_log" ADD CONSTRAINT "hydration_log_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "hydration_log_athlete_idx" ON "hydration_log" USING btree ("athlete_id");
  CREATE INDEX IF NOT EXISTS "hydration_log_updated_at_idx" ON "hydration_log" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "hydration_log_created_at_idx" ON "hydration_log" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hydration_log_fk" FOREIGN KEY ("hydration_log_id") REFERENCES "public"."hydration_log"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_hydration_log_id_idx" ON "payload_locked_documents_rels" USING btree ("hydration_log_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hydration_log" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "hydration_log" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hydration_log_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_hydration_log_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "hydration_log_id";`)
}
