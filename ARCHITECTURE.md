# 🏗️ KredoPay Database Architecture (Supabase)

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        KredoPay Web App                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                    ┌─────────▼─────────┐
                    │  Supabase Client  │
                    │  (SDK)            │
                    └─────────┬─────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐         ┌───────▼────────┐
        │  Local Dev     │         │  Production    │
        │  (Supabase)    │         │  (Supabase)    │
        └───────┬────────┘         └───────┬────────┘
                │                           │
        ┌───────▼────────┐         ┌───────▼────────┐
        │ Project URL    │         │ Project URL    │
        │ Anon Key       │         │ Anon Key       │
        └────────────────┘         └────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         API Route                                 │
│  (app/api/cards/route.ts, app/api/auth/send-otp/route.ts, etc)  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ import { supabase } from "@/lib/supabase"
                           │
                ┌──────────▼──────────┐
                │   Supabase SDK      │
                │   (PostgreSQL)      │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │   Supabase Cloud    │
                └─────────────────────┘
```

## Database Schema

### virtual_cards

- `id` (PK) TEXT
- `user_email` TEXT
- `name` TEXT
- `card_number` TEXT
- `expiry_date` TEXT
- `cvv` TEXT
- `balance` DECIMAL
- `currency` TEXT
- `status` TEXT
- `spending_limit` DECIMAL
- `created_at` BIGINT
- `last_used` BIGINT

### transactions

- `id` (PK) TEXT
- `card_id` (FK) TEXT
- `user_email` TEXT
- `type` TEXT
- `amount` DECIMAL
- `merchant` TEXT
- `timestamp` BIGINT
- `status` TEXT

### spending_intents

- `id` (PK) TEXT
- `user_email` TEXT
- `type` TEXT
- `description` TEXT
- `amount` DECIMAL
- `currency` TEXT
- `status` TEXT
- `merchant` TEXT
- `category` TEXT
- `created_at` BIGINT
- `updated_at` BIGINT
- `proof_hash` TEXT
- `executed_at` BIGINT

### otp_codes

- `id` (PK) BIGSERIAL
- `email` TEXT
- `otp_code` TEXT
- `created_at` BIGINT
- `expires_at` BIGINT
- `used` BOOLEAN

## Environment Variables

### .env.local / Cloudflare Pages

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Used in server-side routes)
- `JWT_SECRET`
- `RESEND_API_KEY`
