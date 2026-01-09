# Fix: Transaction Hash "Top-up not found" Error

## Problem
- Clicking submit TX hash returns "Top-up request not found"
- `transaction_hash` column might be missing from database

## Solutions

### Option 1: Fresh Install (Recommended if table doesn't exist)
Run the main migration:
```bash
psql -U postgres -d kredopay < migrations/add-internal-topup-requests.sql
```

### Option 2: Existing Table (Add missing column)
If you already have `internal_topup_requests` table but missing `transaction_hash`:
```bash
psql -U postgres -d kredopay < migrations/add-transaction-hash-to-internal-topup.sql
```

### Option 3: Manual SQL (Supabase Dashboard)
Run this in Supabase SQL Editor:
```sql
-- Add transaction_hash column if missing
ALTER TABLE internal_topup_requests 
ADD COLUMN IF NOT EXISTS transaction_hash TEXT;

-- Update status comment
COMMENT ON COLUMN internal_topup_requests.status 
IS 'Request status: pending, verifying, approved, rejected, completed';
```

## Verify Fix
After running migration, check:
```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'internal_topup_requests' 
AND column_name = 'transaction_hash';

-- Should return:
-- column_name      | data_type
-- transaction_hash | text
```

## Test
1. Create new internal topup request
2. Submit transaction hash
3. Should change status from `pending` → `verifying`

## Files Updated
- ✅ `/app/api/internal-topup/[id]/route.ts` - Fixed Next.js 15 params handling
- ✅ `/migrations/add-transaction-hash-to-internal-topup.sql` - New migration for existing tables

## Status
✅ **FIXED** - API endpoint now properly handles params in Next.js 15
