import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "agencies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"contact_info" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
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
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "nutritionists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"license_number" varchar,
  	"specialization" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "trainers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"certification" varchar,
  	"specialization" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "agencies_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "athlete_profiles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "nutritionists_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "trainers_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "agencies_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "athlete_profiles_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "nutritionists_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "trainers_id" integer;
  DO $$ BEGIN
   ALTER TABLE "agencies" ADD CONSTRAINT "agencies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
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
  
  DO $$ BEGIN
   ALTER TABLE "nutritionists" ADD CONSTRAINT "nutritionists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "trainers" ADD CONSTRAINT "trainers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "agencies_user_idx" ON "agencies" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "agencies_updated_at_idx" ON "agencies" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "agencies_created_at_idx" ON "agencies" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "agencies_email_idx" ON "agencies" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "athlete_profiles_agency_idx" ON "athlete_profiles" USING btree ("agency_id");
  CREATE INDEX IF NOT EXISTS "athlete_profiles_user_idx" ON "athlete_profiles" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "athlete_profiles_updated_at_idx" ON "athlete_profiles" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "athlete_profiles_created_at_idx" ON "athlete_profiles" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "athlete_profiles_email_idx" ON "athlete_profiles" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "nutritionists_user_idx" ON "nutritionists" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "nutritionists_updated_at_idx" ON "nutritionists" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "nutritionists_created_at_idx" ON "nutritionists" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "nutritionists_email_idx" ON "nutritionists" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "trainers_user_idx" ON "trainers" USING btree ("user_id");
  CREATE INDEX IF NOT EXISTS "trainers_updated_at_idx" ON "trainers" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "trainers_created_at_idx" ON "trainers" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "trainers_email_idx" ON "trainers" USING btree ("email");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agencies_fk" FOREIGN KEY ("agencies_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_athlete_profiles_fk" FOREIGN KEY ("athlete_profiles_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nutritionists_fk" FOREIGN KEY ("nutritionists_id") REFERENCES "public"."nutritionists"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trainers_fk" FOREIGN KEY ("trainers_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_agencies_fk" FOREIGN KEY ("agencies_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_athlete_profiles_fk" FOREIGN KEY ("athlete_profiles_id") REFERENCES "public"."athlete_profiles"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_nutritionists_fk" FOREIGN KEY ("nutritionists_id") REFERENCES "public"."nutritionists"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_trainers_fk" FOREIGN KEY ("trainers_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_agencies_id_idx" ON "payload_locked_documents_rels" USING btree ("agencies_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_athlete_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("athlete_profiles_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_nutritionists_id_idx" ON "payload_locked_documents_rels" USING btree ("nutritionists_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_trainers_id_idx" ON "payload_locked_documents_rels" USING btree ("trainers_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_agencies_id_idx" ON "payload_preferences_rels" USING btree ("agencies_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_athlete_profiles_id_idx" ON "payload_preferences_rels" USING btree ("athlete_profiles_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_nutritionists_id_idx" ON "payload_preferences_rels" USING btree ("nutritionists_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_trainers_id_idx" ON "payload_preferences_rels" USING btree ("trainers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "agencies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "athlete_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "nutritionists" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "trainers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "agencies" CASCADE;
  DROP TABLE "athlete_profiles" CASCADE;
  DROP TABLE "nutritionists" CASCADE;
  DROP TABLE "trainers" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_agencies_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_athlete_profiles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_nutritionists_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_trainers_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_agencies_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_athlete_profiles_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_nutritionists_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_trainers_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_agencies_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_athlete_profiles_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_nutritionists_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_trainers_id_idx";
  DROP INDEX IF EXISTS "payload_preferences_rels_agencies_id_idx";
  DROP INDEX IF EXISTS "payload_preferences_rels_athlete_profiles_id_idx";
  DROP INDEX IF EXISTS "payload_preferences_rels_nutritionists_id_idx";
  DROP INDEX IF EXISTS "payload_preferences_rels_trainers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "agencies_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "athlete_profiles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "nutritionists_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "trainers_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "agencies_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "athlete_profiles_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "nutritionists_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "trainers_id";`)
}
