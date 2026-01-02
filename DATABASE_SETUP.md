# Database Setup Guide

KredoPay Web App menggunakan **SQLite** untuk development lokal dan **Cloudflare D1** untuk production/preview deployment.

## 🏗️ Architecture

- **Local Development**: SQLite database di `./data/kredo.db` dan `./data/auth.db`
- **Production/Preview**: Cloudflare D1 databases dengan bindings `DB` dan `AUTH_DB`

## 📦 Local Development Setup

### Prerequisites
- Bun v1.2.22 atau lebih tinggi
- Node.js (untuk compatibility)

### Installation

1. Install dependencies:
```bash
bun install
```

2. Database akan otomatis dibuat saat pertama kali menjalankan aplikasi:
```bash
bun run dev
# atau
make dev
```

3. File database akan dibuat di:
   - `./data/kredo.db` - Main database (cards, transactions, intents)
   - `./data/auth.db` - Auth database (OTP codes)

### Database Location
```
kredopay-web-app/
├── data/
│   ├── kredo.db      # Main database
│   └── auth.db       # Auth database
```

## ☁️ Cloudflare D1 Setup

### 1. Create D1 Databases

Buat database D1 untuk production:

```bash
# Main database
wrangler d1 create kredopay-db

# Auth database
wrangler d1 create kredopay-auth-db
```

Buat database D1 untuk preview:

```bash
# Main database (preview)
wrangler d1 create kredopay-db-preview

# Auth database (preview)
wrangler d1 create kredopay-auth-db-preview
```

### 2. Update wrangler.toml

Setelah membuat database, Wrangler akan memberikan `database_id`. Update file `wrangler.toml`:

```toml
[env.production]
[[env.production.d1_databases]]
binding = "DB"
database_name = "kredopay-db"
database_id = "YOUR_PRODUCTION_DB_ID"  # Ganti dengan ID dari wrangler d1 create

[[env.production.d1_databases]]
binding = "AUTH_DB"
database_name = "kredopay-auth-db"
database_id = "YOUR_PRODUCTION_AUTH_DB_ID"  # Ganti dengan ID dari wrangler d1 create

[env.preview]
[[env.preview.d1_databases]]
binding = "DB"
database_name = "kredopay-db-preview"
database_id = "YOUR_PREVIEW_DB_ID"  # Ganti dengan ID dari wrangler d1 create

[[env.preview.d1_databases]]
binding = "AUTH_DB"
database_name = "kredopay-auth-db-preview"
database_id = "YOUR_PREVIEW_AUTH_DB_ID"  # Ganti dengan ID dari wrangler d1 create
```

### 3. Run Migrations

Jalankan migration untuk setup schema:

```bash
# Production - Main DB
wrangler d1 execute kredopay-db --file=./scripts/migrations/001_init_main_db.sql --env production

# Production - Auth DB
wrangler d1 execute kredopay-auth-db --file=./scripts/migrations/002_init_auth_db.sql --env production

# Preview - Main DB
wrangler d1 execute kredopay-db-preview --file=./scripts/migrations/001_init_main_db.sql --env preview

# Preview - Auth DB
wrangler d1 execute kredopay-auth-db-preview --file=./scripts/migrations/002_init_auth_db.sql --env preview
```

### 4. Verify Database Setup

Cek apakah tables sudah dibuat:

```bash
# Production
wrangler d1 execute kredopay-db --command "SELECT name FROM sqlite_master WHERE type='table';" --env production

# Preview
wrangler d1 execute kredopay-db-preview --command "SELECT name FROM sqlite_master WHERE type='table';" --env preview
```

## 🚀 Deployment

### Build & Deploy to Cloudflare Pages

```bash
# Build
bun run pages:build

# Deploy
bun run pages:deploy
```

Atau deploy langsung:

```bash
bun run pages:deploy
```

### Environment Variables

Pastikan environment variables sudah di-set di Cloudflare Pages dashboard:

1. Go to: Cloudflare Dashboard → Pages → kredopay-web-app → Settings → Environment Variables
2. Add variables dari `env.example`:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `JWT_SECRET`
   - `DEV_EMAIL` (optional, untuk dev bypass)
   - `DEV_OTP` (optional, untuk dev bypass)
   - `NEXT_PUBLIC_SHOW_DAPP`

## 🔍 Database Schema

### Main Database (kredo.db / DB binding)

**virtual_cards**
- `id` (TEXT, PRIMARY KEY)
- `user_email` (TEXT)
- `name` (TEXT)
- `card_number` (TEXT)
- `expiry_date` (TEXT)
- `cvv` (TEXT)
- `balance` (REAL)
- `currency` (TEXT, default: 'USDC')
- `status` (TEXT, default: 'active')
- `spending_limit` (REAL)
- `created_at` (INTEGER)
- `last_used` (INTEGER)

**transactions**
- `id` (TEXT, PRIMARY KEY)
- `card_id` (TEXT, FOREIGN KEY)
- `user_email` (TEXT)
- `type` (TEXT)
- `amount` (REAL)
- `merchant` (TEXT)
- `timestamp` (INTEGER)
- `status` (TEXT, default: 'completed')

**spending_intents**
- `id` (TEXT, PRIMARY KEY)
- `user_email` (TEXT)
- `type` (TEXT)
- `description` (TEXT)
- `amount` (REAL)
- `currency` (TEXT, default: 'USDC')
- `status` (TEXT, default: 'pending_proof')
- `merchant` (TEXT)
- `category` (TEXT)
- `created_at` (INTEGER)
- `updated_at` (INTEGER)
- `proof_hash` (TEXT)
- `executed_at` (INTEGER)

### Auth Database (auth.db / AUTH_DB binding)

**otp_codes**
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `email` (TEXT)
- `otp_code` (TEXT)
- `created_at` (INTEGER)
- `expires_at` (INTEGER)
- `used` (BOOLEAN, default: 0)

## 🛠️ Development Tips

### Reset Local Database

Jika ingin reset database lokal:

```bash
rm -rf data/*.db
bun run dev  # Database akan dibuat ulang
```

### Query D1 Database

```bash
# Query production database
wrangler d1 execute kredopay-db --command "SELECT * FROM virtual_cards LIMIT 10;" --env production

# Query preview database
wrangler d1 execute kredopay-db-preview --command "SELECT * FROM virtual_cards LIMIT 10;" --env preview
```

### Backup D1 Database

```bash
# Export production database
wrangler d1 export kredopay-db --output=backup-main.sql --env production
wrangler d1 export kredopay-auth-db --output=backup-auth.sql --env production
```

## 📚 Code Usage

### Import Database

```typescript
// For local development (auto-uses SQLite)
import db from '@/lib/db';
import authDb from '@/lib/db-otp';

// For API routes that need to support both environments
import { getDatabase } from '@/lib/db';
import { getOTPDatabase } from '@/lib/db-otp';

// In API route
export async function GET(request: Request, { env }: { env?: { DB?: D1Database } }) {
  const db = getDatabase(env);
  // Use db...
}
```

### Using OTP Database

```typescript
import { OTPDatabase } from '@/lib/db-otp';

// All methods are now async and support both SQLite and D1
await OTPDatabase.createOTP('user@example.com', '123456');
const isValid = await OTPDatabase.verifyOTP('user@example.com', '123456');
```

## 🔐 Security Notes

1. **Never commit** `.env.local` or `data/*.db` files
2. **Rotate** `JWT_SECRET` in production
3. **Use strong** `RESEND_API_KEY` from Resend dashboard
4. **Limit** D1 database access to authorized Cloudflare accounts only

## 📞 Troubleshooting

### Error: "better-sqlite3 native bindings"

```bash
bun install
# or
bun rebuild better-sqlite3
```

### D1 Database Not Found

Pastikan:
1. Database sudah dibuat dengan `wrangler d1 create`
2. `database_id` di `wrangler.toml` sudah benar
3. Migration sudah dijalankan

### Environment Variables Not Working

Pastikan environment variables sudah di-set di:
- Local: `.env.local` file
- Production: Cloudflare Pages dashboard → Settings → Environment Variables

---

**Happy Coding! 🚀**
