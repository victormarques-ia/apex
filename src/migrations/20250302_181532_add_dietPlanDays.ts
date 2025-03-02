import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "diet_plan_days" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"diet_plan_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"day_of_week" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "diet_plan_days_id" integer;
  DO $$ BEGIN
   ALTER TABLE "diet_plan_days" ADD CONSTRAINT "diet_plan_days_diet_plan_id_diet_plans_id_fk" FOREIGN KEY ("diet_plan_id") REFERENCES "public"."diet_plans"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "diet_plan_days_diet_plan_idx" ON "diet_plan_days" USING btree ("diet_plan_id");
  CREATE INDEX IF NOT EXISTS "diet_plan_days_updated_at_idx" ON "diet_plan_days" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "diet_plan_days_created_at_idx" ON "diet_plan_days" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_diet_plan_days_fk" FOREIGN KEY ("diet_plan_days_id") REFERENCES "public"."diet_plan_days"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_diet_plan_days_id_idx" ON "payload_locked_documents_rels" USING btree ("diet_plan_days_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "diet_plan_days" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "diet_plan_days" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_diet_plan_days_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_diet_plan_days_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "diet_plan_days_id";`)
}
