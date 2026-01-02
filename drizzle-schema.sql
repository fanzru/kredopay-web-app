-- Drizzle Schema for KredoPay
-- Generated from lib/schema.ts

-- Virtual Cards Table
CREATE TABLE IF NOT EXISTS "virtual_cards" (
  "id" text PRIMARY KEY NOT NULL,
  "user_email" text NOT NULL,
  "name" text NOT NULL,
  "card_number" text NOT NULL,
  "expiry_date" text NOT NULL,
  "cvv" text NOT NULL,
  "balance" numeric DEFAULT '0',
  "currency" text DEFAULT 'USDC',
  "status" text DEFAULT 'active',
  "spending_limit" numeric,
  "created_at" bigint NOT NULL,
  "last_used" bigint
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" text PRIMARY KEY NOT NULL,
  "card_id" text NOT NULL,
  "user_email" text NOT NULL,
  "type" text NOT NULL,
  "amount" numeric NOT NULL,
  "merchant" text NOT NULL,
  "timestamp" bigint NOT NULL,
  "status" text DEFAULT 'completed'
);

-- Spending Intents Table
CREATE TABLE IF NOT EXISTS "spending_intents" (
  "id" text PRIMARY KEY NOT NULL,
  "user_email" text NOT NULL,
  "type" text NOT NULL,
  "description" text NOT NULL,
  "amount" numeric NOT NULL,
  "currency" text DEFAULT 'USDC',
  "status" text DEFAULT 'pending_proof',
  "merchant" text,
  "category" text,
  "created_at" bigint NOT NULL,
  "updated_at" bigint,
  "proof_hash" text,
  "executed_at" bigint
);

-- OTP Codes Table
CREATE TABLE IF NOT EXISTS "otp_codes" (
  "id" bigserial PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "otp_code" text NOT NULL,
  "created_at" bigint NOT NULL,
  "expires_at" bigint NOT NULL,
  "used" boolean DEFAULT false
);

-- Foreign Keys
ALTER TABLE "transactions" 
  ADD CONSTRAINT "transactions_card_id_virtual_cards_id_fk" 
  FOREIGN KEY ("card_id") 
  REFERENCES "public"."virtual_cards"("id") 
  ON DELETE cascade 
  ON UPDATE no action;

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_cards_user" ON "virtual_cards" USING btree ("user_email");
CREATE INDEX IF NOT EXISTS "idx_transactions_card" ON "transactions" USING btree ("card_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_user" ON "transactions" USING btree ("user_email");
CREATE INDEX IF NOT EXISTS "idx_intents_user" ON "spending_intents" USING btree ("user_email");
CREATE INDEX IF NOT EXISTS "idx_intents_status" ON "spending_intents" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_otp_email" ON "otp_codes" USING btree ("email");
CREATE INDEX IF NOT EXISTS "idx_otp_expires" ON "otp_codes" USING btree ("expires_at");
