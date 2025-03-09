import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "daily_consumption" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"athlete_id" integer,
  	"food_id" integer,
  	"date" timestamp(3) with time zone NOT NULL,
  	"quantity_grams" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "daily_consumption_id" integer;
  DO $$ BEGIN
   ALTER TABLE "daily_consumption" ADD CONSTRAINT "daily_consumption_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "daily_consumption" ADD CONSTRAINT "daily_consumption_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "daily_consumption_athlete_idx" ON "daily_consumption" USING btree ("athlete_id");
  CREATE INDEX IF NOT EXISTS "daily_consumption_food_idx" ON "daily_consumption" USING btree ("food_id");
  CREATE INDEX IF NOT EXISTS "daily_consumption_updated_at_idx" ON "daily_consumption" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "daily_consumption_created_at_idx" ON "daily_consumption" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_daily_consumption_fk" FOREIGN KEY ("daily_consumption_id") REFERENCES "public"."daily_consumption"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_daily_consumption_id_idx" ON "payload_locked_documents_rels" USING btree ("daily_consumption_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "daily_consumption" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "daily_consumption" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_daily_consumption_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_daily_consumption_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "daily_consumption_id";`)
}
