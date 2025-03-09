import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "meal_food" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"meal_id" integer NOT NULL,
  	"food_id" integer NOT NULL,
  	"quantity_grams" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "meal_food_id" integer;
  DO $$ BEGIN
   ALTER TABLE "meal_food" ADD CONSTRAINT "meal_food_meal_id_meal_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meal"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "meal_food" ADD CONSTRAINT "meal_food_food_id_food_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."food"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "meal_food_meal_idx" ON "meal_food" USING btree ("meal_id");
  CREATE INDEX IF NOT EXISTS "meal_food_food_idx" ON "meal_food" USING btree ("food_id");
  CREATE INDEX IF NOT EXISTS "meal_food_updated_at_idx" ON "meal_food" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "meal_food_created_at_idx" ON "meal_food" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meal_food_fk" FOREIGN KEY ("meal_food_id") REFERENCES "public"."meal_food"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_meal_food_id_idx" ON "payload_locked_documents_rels" USING btree ("meal_food_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "meal_food" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "meal_food" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_meal_food_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_meal_food_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "meal_food_id";`)
}
