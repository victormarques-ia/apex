import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "trainer_athletes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"trainer_id" integer NOT NULL,
  	"athlete_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "trainer_athletes_id" integer;
  DO $$ BEGIN
   ALTER TABLE "trainer_athletes" ADD CONSTRAINT "trainer_athletes_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "trainer_athletes" ADD CONSTRAINT "trainer_athletes_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "trainer_athletes_trainer_idx" ON "trainer_athletes" USING btree ("trainer_id");
  CREATE INDEX IF NOT EXISTS "trainer_athletes_athlete_idx" ON "trainer_athletes" USING btree ("athlete_id");
  CREATE INDEX IF NOT EXISTS "trainer_athletes_updated_at_idx" ON "trainer_athletes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "trainer_athletes_created_at_idx" ON "trainer_athletes" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trainer_athletes_fk" FOREIGN KEY ("trainer_athletes_id") REFERENCES "public"."trainer_athletes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_trainer_athletes_id_idx" ON "payload_locked_documents_rels" USING btree ("trainer_athletes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "trainer_athletes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "trainer_athletes" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_trainer_athletes_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_trainer_athletes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "trainer_athletes_id";`)
}
