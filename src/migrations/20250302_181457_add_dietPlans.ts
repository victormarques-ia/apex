import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "diet_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"athlete_id" integer NOT NULL,
  	"nutritionist_id" integer NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"total_daily_calories" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "diet_plans_id" integer;
  DO $$ BEGIN
   ALTER TABLE "diet_plans" ADD CONSTRAINT "diet_plans_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "diet_plans" ADD CONSTRAINT "diet_plans_nutritionist_id_nutritionists_id_fk" FOREIGN KEY ("nutritionist_id") REFERENCES "public"."nutritionists"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "diet_plans_athlete_idx" ON "diet_plans" USING btree ("athlete_id");
  CREATE INDEX IF NOT EXISTS "diet_plans_nutritionist_idx" ON "diet_plans" USING btree ("nutritionist_id");
  CREATE INDEX IF NOT EXISTS "diet_plans_updated_at_idx" ON "diet_plans" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "diet_plans_created_at_idx" ON "diet_plans" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_diet_plans_fk" FOREIGN KEY ("diet_plans_id") REFERENCES "public"."diet_plans"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_diet_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("diet_plans_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "diet_plans" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "diet_plans" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_diet_plans_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_diet_plans_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "diet_plans_id";`)
}
