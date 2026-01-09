# Admin API - Approve & Issue Internal Top-Up

## 🔑 Setup Environment Variables

Add to `.env.local`:
```bash
# Generate secure API key
ADMIN_API_KEY=$(openssl rand -hex 32)
# Or use this for testing:
ADMIN_API_KEY=your-super-secret-admin-key-here
```

## 📋 Complete Flow

### 1. Get Pending Top-Up Requests
```bash
# List all pending requests (admin view)
curl -X GET "http://localhost:3000/api/internal-topup" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "X-User-Email: user@example.com"
```

**Response:**
```json
{
  "topups": [
    {
      "id": "ITOP-1767960791752-5xnmxzv",
      "userEmail": "user@example.com",
      "requestedAmount": "1000.00",
      "exactAmount": "1000.3961",
      "decimalCode": "3961",
      "status": "verifying",
      "transactionHash": "5xF7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
      "cardId": "card-xyz",
      "createdAt": 1767960791752
    }
  ]
}
```

### 2. Approve & Issue Top-Up (Admin Only)
```bash
# Replace these variables:
# - TOPUP_ID: The ID from step 1 (e.g., ITOP-1767960791752-5xnmxzv)
# - ADMIN_API_KEY: Your admin API key from .env.local

curl -X POST "http://localhost:3000/api/internal-topup/issue/ITOP-1767960791752-5xnmxzv" \
  -H "Content-Type: application/json" \
  -H "X-Admin-API-Key: your-super-secret-admin-key-here" \
  -d '{
    "adminEmail": "admin@kredopay.com",
    "adminNotes": "Verified on Solscan - transaction confirmed"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "topup": {
    "id": "ITOP-1767960791752-5xnmxzv",
    "status": "completed",
    "requestedAmount": "1000.00",
    "exactAmount": "1000.3961"
  },
  "card": {
    "id": "card-xyz",
    "name": "Main Card",
    "balance": 1000.00,
    "previousBalance": 0.00
  },
  "transaction": {
    "id": "tx-abc123",
    "type": "topup",
    "amount": 1000.00,
    "description": "Internal Top-Up - ITOP-1767960791752-5xnmxzv"
  }
}
```

## 🚀 Quick Test Script

Save as `test-admin-approve.sh`:
```bash
#!/bin/bash

# Configuration
TOPUP_ID="ITOP-1767960791752-5xnmxzv"  # Replace with actual ID
ADMIN_API_KEY="your-super-secret-admin-key-here"  # Replace with your key
BASE_URL="http://localhost:3000"

echo "🔍 Approving and issuing top-up: $TOPUP_ID"

curl -X POST "$BASE_URL/api/internal-topup/issue/$TOPUP_ID" \
  -H "Content-Type: application/json" \
  -H "X-Admin-API-Key: $ADMIN_API_KEY" \
  -d '{
    "adminEmail": "admin@kredopay.com",
    "adminNotes": "Verified on Solscan - transaction confirmed"
  }' | jq '.'

echo ""
echo "✅ Done! Check the response above."
```

Make executable and run:
```bash
chmod +x test-admin-approve.sh
./test-admin-approve.sh
```

## 📝 What This Does

1. ✅ **Verifies** the top-up request exists and is in `verifying` status
2. ✅ **Updates** card balance with the requested amount
3. ✅ **Creates** transaction record for audit trail
4. ✅ **Marks** top-up as `completed`
5. ✅ **Returns** updated card balance and transaction details

## 🔒 Security Notes

- ⚠️ **NEVER** commit `ADMIN_API_KEY` to git
- ⚠️ Use strong random keys in production
- ⚠️ This endpoint is admin-only (requires API key)
- ✅ All actions are logged with admin email and notes

## 🧪 Testing Flow

1. **User creates top-up** → Status: `pending`
2. **User submits TX hash** → Status: `verifying`
3. **Admin verifies on Solscan** → Check transaction
4. **Admin approves** (this curl) → Status: `completed` + Balance updated! 💰

## 📊 Check Results

After approval, verify in database:
```sql
-- Check top-up status
SELECT id, status, requested_amount, approved_by, completed_at 
FROM internal_topup_requests 
WHERE id = 'ITOP-1767960791752-5xnmxzv';

-- Check card balance
SELECT id, name, balance 
FROM virtual_cards 
WHERE id = 'card-xyz';

-- Check transaction
SELECT id, type, amount, description, created_at 
FROM transactions 
WHERE description LIKE '%ITOP-1767960791752-5xnmxzv%';
```

## 🎯 Production Usage

For production, use environment variables:
```bash
export ADMIN_API_KEY="your-production-key"
export TOPUP_ID="ITOP-xxx"

curl -X POST "https://your-domain.com/api/internal-topup/issue/$TOPUP_ID" \
  -H "Content-Type: application/json" \
  -H "X-Admin-API-Key: $ADMIN_API_KEY" \
  -d '{
    "adminEmail": "admin@kredopay.com",
    "adminNotes": "Verified transaction on Solscan"
  }'
```

---

**Created:** 2026-01-09  
**Status:** Ready to use! 🚀
