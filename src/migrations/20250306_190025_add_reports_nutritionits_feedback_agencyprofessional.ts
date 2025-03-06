import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"created_by_id" integer NOT NULL,
  	"athlete_id" integer NOT NULL,
  	"content" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "agency_professionals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"agency_id" integer NOT NULL,
  	"professional_id" integer NOT NULL,
  	"role" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "nutritionist_athletes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nutritionist_id" integer NOT NULL,
  	"athlete_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "feedbacks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"sender_id" integer NOT NULL,
  	"receiver_id" integer NOT NULL,
  	"message" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reports_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "agency_professionals_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "nutritionist_athletes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "feedbacks_id" integer;
  DO $$ BEGIN
   ALTER TABLE "reports" ADD CONSTRAINT "reports_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "reports" ADD CONSTRAINT "reports_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "agency_professionals" ADD CONSTRAINT "agency_professionals_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "agency_professionals" ADD CONSTRAINT "agency_professionals_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "nutritionist_athletes" ADD CONSTRAINT "nutritionist_athletes_nutritionist_id_nutritionists_id_fk" FOREIGN KEY ("nutritionist_id") REFERENCES "public"."nutritionists"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "nutritionist_athletes" ADD CONSTRAINT "nutritionist_athletes_athlete_id_athlete_profiles_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "reports_created_by_idx" ON "reports" USING btree ("created_by_id");
  CREATE INDEX IF NOT EXISTS "reports_athlete_idx" ON "reports" USING btree ("athlete_id");
  CREATE INDEX IF NOT EXISTS "reports_updated_at_idx" ON "reports" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "reports_created_at_idx" ON "reports" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "agency_professionals_agency_idx" ON "agency_professionals" USING btree ("agency_id");
  CREATE INDEX IF NOT EXISTS "agency_professionals_professional_idx" ON "agency_professionals" USING btree ("professional_id");
  CREATE INDEX IF NOT EXISTS "agency_professionals_updated_at_idx" ON "agency_professionals" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "agency_professionals_created_at_idx" ON "agency_professionals" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "nutritionist_athletes_nutritionist_idx" ON "nutritionist_athletes" USING btree ("nutritionist_id");
  CREATE INDEX IF NOT EXISTS "nutritionist_athletes_athlete_idx" ON "nutritionist_athletes" USING btree ("athlete_id");
  CREATE INDEX IF NOT EXISTS "nutritionist_athletes_updated_at_idx" ON "nutritionist_athletes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "nutritionist_athletes_created_at_idx" ON "nutritionist_athletes" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "feedbacks_sender_idx" ON "feedbacks" USING btree ("sender_id");
  CREATE INDEX IF NOT EXISTS "feedbacks_receiver_idx" ON "feedbacks" USING btree ("receiver_id");
  CREATE INDEX IF NOT EXISTS "feedbacks_updated_at_idx" ON "feedbacks" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "feedbacks_created_at_idx" ON "feedbacks" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reports_fk" FOREIGN KEY ("reports_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agency_professionals_fk" FOREIGN KEY ("agency_professionals_id") REFERENCES "public"."agency_professionals"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nutritionist_athletes_fk" FOREIGN KEY ("nutritionist_athletes_id") REFERENCES "public"."nutritionist_athletes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedbacks_fk" FOREIGN KEY ("feedbacks_id") REFERENCES "public"."feedbacks"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("reports_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_agency_professionals_id_idx" ON "payload_locked_documents_rels" USING btree ("agency_professionals_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_nutritionist_athletes_id_idx" ON "payload_locked_documents_rels" USING btree ("nutritionist_athletes_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_feedbacks_id_idx" ON "payload_locked_documents_rels" USING btree ("feedbacks_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reports" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "agency_professionals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nutritionist_athletes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "feedbacks" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "reports" CASCADE;
  DROP TABLE "agency_professionals" CASCADE;
  DROP TABLE "nutritionist_athletes" CASCADE;
  DROP TABLE "feedbacks" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reports_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_agency_professionals_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_nutritionist_athletes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_feedbacks_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_reports_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_agency_professionals_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_nutritionist_athletes_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_feedbacks_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "reports_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "agency_professionals_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "nutritionist_athletes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "feedbacks_id";`)
}
