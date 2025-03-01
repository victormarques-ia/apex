import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "athlete_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"agency_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"weight" numeric,
  	"height" numeric,
  	"dietary_habits" varchar,
  	"physical_activity_habits" varchar,
  	"birth_date" timestamp(3) with time zone,
  	"gender" varchar,
  	"goal" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "athlete_profiles_id" integer;
  DO $$ BEGIN
   ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "athlete_profiles" ADD CONSTRAINT "athlete_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "athlete_profiles_agency_idx" ON "athlete_profiles" USING btree ("agency_id");
  CREATE INDEX IF NOT EXISTS "athlete_profiles_user_idx" ON "athlete_profiles" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "athlete_profiles_updated_at_idx" ON "athlete_profiles" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "athlete_profiles_created_at_idx" ON "athlete_profiles" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_athlete_profiles_fk" FOREIGN KEY ("athlete_profiles_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_athlete_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("athlete_profiles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "athlete_profiles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "athlete_profiles" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_athlete_profiles_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_athlete_profiles_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "athlete_profiles_id";`)
}
