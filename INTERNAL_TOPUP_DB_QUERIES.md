# 🗄️ Internal Top-Up - Database Query Reference

Quick reference untuk admin yang akan manually approve dan issue balance via database.

---

## 📋 Quick Reference Commands

### 1. View All Pending Requests

```sql
SELECT 
    id,
    user_email,
    requested_amount,
    currency,
    user_wallet_address,
    topup_method,
    status,
    TO_TIMESTAMP(created_at/1000) as created_date,
    card_id
FROM internal_topup_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### 2. View Specific User's Requests

```sql
SELECT 
    id,
    requested_amount,
    user_wallet_address,
    status,
    TO_TIMESTAMP(created_at/1000) as created_date,
    TO_TIMESTAMP(approved_at/1000) as approved_date,
    TO_TIMESTAMP(completed_at/1000) as completed_date,
    rejection_reason
FROM internal_topup_requests
WHERE user_email = 'user@example.com'
ORDER BY created_at DESC;
```

---

## ✅ Complete Approval & Issuance Process

### Step 1: Find Pending Request

```sql
-- Get request details
SELECT 
    id,
    user_email,
    requested_amount,
    user_wallet_address,
    card_id,
    status
FROM internal_topup_requests
WHERE id = 'ITOP-1234567890-abc123';
```

### Step 2: Verify User's Card

```sql
-- Check if card exists and belongs to user
SELECT 
    id,
    name,
    balance,
    currency,
    status
FROM virtual_cards
WHERE id = 'card-xyz123'
AND user_email = 'user@example.com'
AND status = 'active';
```

### Step 3: Approve Request

```sql
-- Mark as approved
UPDATE internal_topup_requests
SET 
    status = 'approved',
    approved_at = EXTRACT(EPOCH FROM NOW()) * 1000,
    approved_by = 'admin@kredopay.com',
    admin_notes = 'Wallet verified - proceeding with balance issuance'
WHERE id = 'ITOP-1234567890-abc123'
AND status = 'pending';

-- Verify update
SELECT status, approved_at, approved_by 
FROM internal_topup_requests 
WHERE id = 'ITOP-1234567890-abc123';
```

### Step 4: Issue Balance to Card

```sql
-- Update card balance
UPDATE virtual_cards
SET 
    balance = balance + 100.00,  -- Replace with actual amount
    last_used = EXTRACT(EPOCH FROM NOW()) * 1000
WHERE id = 'card-xyz123';

-- Verify balance update
SELECT id, name, balance 
FROM virtual_cards 
WHERE id = 'card-xyz123';
```

### Step 5: Create Transaction Record

```sql
-- Create transaction for audit trail
INSERT INTO transactions (
    id,
    card_id,
    user_email,
    type,
    amount,
    merchant,
    timestamp,
    status
) VALUES (
    'tx-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT || '-' || substr(md5(random()::text), 1, 7),
    'card-xyz123',                    -- Replace with actual card_id
    'user@example.com',               -- Replace with actual user_email
    'topup_internal',
    100.00,                           -- Replace with actual amount
    'Internal Top-Up',
    FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000),
    'completed'
);

-- Verify transaction created
SELECT id, type, amount, merchant, status 
FROM transactions 
WHERE card_id = 'card-xyz123' 
ORDER BY timestamp DESC 
LIMIT 1;
```

### Step 6: Mark Request as Completed

```sql
-- Mark top-up request as completed
UPDATE internal_topup_requests
SET 
    status = 'completed',
    completed_at = EXTRACT(EPOCH FROM NOW()) * 1000
WHERE id = 'ITOP-1234567890-abc123'
AND status = 'approved';

-- Verify completion
SELECT id, status, completed_at 
FROM internal_topup_requests 
WHERE id = 'ITOP-1234567890-abc123';
```

---

## ❌ Rejection Process

### Reject with Reason

```sql
-- Reject request
UPDATE internal_topup_requests
SET 
    status = 'rejected',
    rejected_at = EXTRACT(EPOCH FROM NOW()) * 1000,
    rejection_reason = 'Unable to verify wallet ownership',
    admin_notes = 'Wallet address does not match our records'
WHERE id = 'ITOP-1234567890-abc123'
AND status = 'pending';

-- Verify rejection
SELECT id, status, rejection_reason 
FROM internal_topup_requests 
WHERE id = 'ITOP-1234567890-abc123';
```

---

## 🔍 Monitoring Queries

### Daily Statistics

```sql
-- Today's requests summary
SELECT 
    status,
    COUNT(*) as count,
    SUM(CAST(requested_amount AS DECIMAL)) as total_amount
FROM internal_topup_requests
WHERE created_at >= EXTRACT(EPOCH FROM DATE_TRUNC('day', NOW())) * 1000
GROUP BY status
ORDER BY status;
```

### Pending Requests Count

```sql
-- Count pending requests
SELECT COUNT(*) as pending_count
FROM internal_topup_requests
WHERE status = 'pending';
```

### Average Approval Time

```sql
-- Average time to approve (in hours)
SELECT 
    AVG((approved_at - created_at) / 1000 / 60 / 60) as avg_hours_to_approve
FROM internal_topup_requests
WHERE status IN ('approved', 'completed')
AND approved_at IS NOT NULL;
```

### Top Users by Request Volume

```sql
-- Users with most requests
SELECT 
    user_email,
    COUNT(*) as request_count,
    SUM(CAST(requested_amount AS DECIMAL)) as total_requested
FROM internal_topup_requests
GROUP BY user_email
ORDER BY request_count DESC
LIMIT 10;
```

---

## 🧹 Cleanup Queries

### Delete Old Rejected Requests (>30 days)

```sql
-- View old rejected requests first
SELECT id, user_email, requested_amount, rejected_at
FROM internal_topup_requests
WHERE status = 'rejected'
AND rejected_at < EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days')) * 1000;

-- Delete if confirmed
DELETE FROM internal_topup_requests
WHERE status = 'rejected'
AND rejected_at < EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days')) * 1000;
```

---

## 📊 Audit Trail Query

### Complete History for a User

```sql
SELECT 
    itr.id as request_id,
    itr.requested_amount,
    itr.user_wallet_address,
    itr.status,
    TO_TIMESTAMP(itr.created_at/1000) as created,
    TO_TIMESTAMP(itr.approved_at/1000) as approved,
    TO_TIMESTAMP(itr.completed_at/1000) as completed,
    itr.approved_by,
    itr.admin_notes,
    t.id as transaction_id,
    t.amount as credited_amount
FROM internal_topup_requests itr
LEFT JOIN transactions t ON t.card_id = itr.card_id 
    AND t.type = 'topup_internal'
    AND t.timestamp >= itr.created_at
    AND t.timestamp <= COALESCE(itr.completed_at, itr.created_at + 86400000)
WHERE itr.user_email = 'user@example.com'
ORDER BY itr.created_at DESC;
```

---

## 🚨 Emergency Rollback

### Rollback a Completed Top-Up

```sql
-- ONLY USE IN EMERGENCY - This reverses a completed top-up

-- Step 1: Get the details
SELECT 
    itr.id,
    itr.requested_amount,
    itr.card_id,
    itr.user_email,
    vc.balance as current_balance
FROM internal_topup_requests itr
JOIN virtual_cards vc ON vc.id = itr.card_id
WHERE itr.id = 'ITOP-1234567890-abc123';

-- Step 2: Reverse card balance
UPDATE virtual_cards
SET balance = balance - 100.00  -- Replace with actual amount
WHERE id = 'card-xyz123';

-- Step 3: Mark transaction as reversed (optional - or delete)
UPDATE transactions
SET status = 'reversed'
WHERE card_id = 'card-xyz123'
AND type = 'topup_internal'
AND amount = 100.00
AND timestamp >= (SELECT created_at FROM internal_topup_requests WHERE id = 'ITOP-1234567890-abc123')
ORDER BY timestamp DESC
LIMIT 1;

-- Step 4: Update top-up request status
UPDATE internal_topup_requests
SET 
    status = 'rejected',
    rejected_at = EXTRACT(EPOCH FROM NOW()) * 1000,
    rejection_reason = 'Reversed by admin',
    admin_notes = 'Emergency rollback - balance reversed'
WHERE id = 'ITOP-1234567890-abc123';
```

---

## 📝 Notes for Admins

### Before Approving
1. ✅ Verify wallet address format
2. ✅ Check user's account status
3. ✅ Verify card exists and is active
4. ✅ Check for duplicate requests
5. ✅ Confirm amount is reasonable

### After Approving
1. ✅ Verify balance was updated
2. ✅ Verify transaction was created
3. ✅ Verify request status is 'completed'
4. ✅ Check user can see updated balance in UI

### Common Mistakes to Avoid
- ❌ Don't forget to create transaction record
- ❌ Don't update balance without approving request first
- ❌ Don't approve requests with invalid wallet addresses
- ❌ Don't forget to mark request as 'completed' after issuing balance

---

## 🔗 Related Files
- [INTERNAL_TOPUP_SOLUTIONING.md](./INTERNAL_TOPUP_SOLUTIONING.md) - Complete feature documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Database architecture
- [lib/schema.ts](./lib/schema.ts) - Database schema definitions

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-09  
**For:** Database Administrators & Support Team
