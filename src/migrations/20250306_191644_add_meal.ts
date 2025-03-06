import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "meal" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"diet_plan_day_id" integer NOT NULL,
  	"meal_type" varchar NOT NULL,
  	"scheduled_time" timestamp(3) with time zone,
  	"order_index" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "meal_id" integer;
  DO $$ BEGIN
   ALTER TABLE "meal" ADD CONSTRAINT "meal_diet_plan_day_id_diet_plan_days_id_fk" FOREIGN KEY ("diet_plan_day_id") REFERENCES "public"."diet_plan_days"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "meal_diet_plan_day_idx" ON "meal" USING btree ("diet_plan_day_id");
  CREATE INDEX IF NOT EXISTS "meal_updated_at_idx" ON "meal" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "meal_created_at_idx" ON "meal" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meal_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meal"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_meal_id_idx" ON "payload_locked_documents_rels" USING btree ("meal_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "meal" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "meal" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_meal_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_meal_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "meal_id";`)
}
