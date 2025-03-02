import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "exercises" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"muscle_group" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "exercises_id" integer;
  CREATE INDEX IF NOT EXISTS "exercises_updated_at_idx" ON "exercises" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "exercises_created_at_idx" ON "exercises" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exercises_fk" FOREIGN KEY ("exercises_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_exercises_id_idx" ON "payload_locked_documents_rels" USING btree ("exercises_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "exercises" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "exercises" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_exercises_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_exercises_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "exercises_id";`)
}
