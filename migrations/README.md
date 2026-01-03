# Database Migrations

This directory contains SQL migration files for the Kredo Protocol database.

## Migration Files

### 1. `add-deposit-requests.sql`
Adds the `deposit_requests` table for handling top-up requests.

### 2. `add-exact-amount-columns.sql`
Adds exact amount tracking columns to deposit requests.

### 3. `add-staking-tables.sql` ✨ NEW
Adds all staking-related tables:
- `user_profiles` - Wallet addresses and $KREDO balances
- `staking_positions` - Active/completed stakes
- `staking_rewards` - Reward accruals
- `staking_history` - Audit log

### 4. `seed-dev-user-profile.sql` ✨ NEW
Seeds initial dev user profile with:
- Email: `dev@kredopay.app`
- Wallet: `F2hgieC18MeUWaWMoyaxLSQCzS7yAjRz1HgmbGAEpump`
- Balance: 100,000 $KREDO

## Running Migrations

### Option 1: Via Supabase CLI (Recommended)

```bash
# Run all migrations
supabase db reset

# Or run specific migration
supabase db execute --file migrations/add-staking-tables.sql
supabase db execute --file migrations/seed-dev-user-profile.sql
```

### Option 2: Via psql

```bash
# Connect to your database
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Run migration
\i migrations/add-staking-tables.sql
\i migrations/seed-dev-user-profile.sql
```

### Option 3: Via Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of migration file
3. Execute

## Migration Order

For fresh setup, run in this order:

1. `add-deposit-requests.sql`
2. `add-exact-amount-columns.sql`
3. **`add-staking-tables.sql`** ← Run this for staking
4. **`seed-dev-user-profile.sql`** ← Run this to create test user

## Staking Setup Quick Start

```bash
# 1. Run staking tables migration
supabase db execute --file migrations/add-staking-tables.sql

# 2. Seed dev user
supabase db execute --file migrations/seed-dev-user-profile.sql

# 3. Verify
psql -c "SELECT * FROM user_profiles WHERE user_email = 'dev@kredopay.app';"
```

You should see:
```
user_email        | wallet_address                              | kredo_balance
------------------+---------------------------------------------+--------------
dev@kredopay.app  | F2hgieC18MeUWaWMoyaxLSQCzS7yAjRz1HgmbGAEpump | 100000
```

## Testing Staking

After running migrations:

1. Login to app with `dev@kredopay.app` / OTP `000000`
2. Go to `/dashboard/staking`
3. You should see 100,000 $KREDO balance
4. Try staking 10,000 $KREDO with 90-day lock
5. Verify position appears in "Active Stakes"

## Rollback

To rollback staking tables:

```sql
DROP TABLE IF EXISTS staking_history CASCADE;
DROP TABLE IF EXISTS staking_rewards CASCADE;
DROP TABLE IF EXISTS staking_positions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

## Notes

- All timestamps are stored as BIGINT (milliseconds since epoch)
- Balances use DECIMAL type for precision
- Foreign keys have CASCADE delete for data integrity
- Indexes are created for common query patterns
