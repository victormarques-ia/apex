import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "nutritionists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"license_number" varchar,
  	"specialization" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "nutritionists_id" integer;
  DO $$ BEGIN
   ALTER TABLE "nutritionists" ADD CONSTRAINT "nutritionists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "nutritionists_user_idx" ON "nutritionists" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "nutritionists_updated_at_idx" ON "nutritionists" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "nutritionists_created_at_idx" ON "nutritionists" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nutritionists_fk" FOREIGN KEY ("nutritionists_id") REFERENCES "public"."nutritionists"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_nutritionists_id_idx" ON "payload_locked_documents_rels" USING btree ("nutritionists_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "nutritionists" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "nutritionists" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_nutritionists_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_nutritionists_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "nutritionists_id";`)
}
