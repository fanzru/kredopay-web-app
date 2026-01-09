# Internal Top-Up API Documentation

## 🎯 Overview

API endpoints untuk Internal Top-Up feature dengan exact amount verification.

---

## 📡 API Endpoints

### 1. Create Top-Up Request (User)

**Endpoint:** `POST /api/internal-topup`

**Headers:**
```
Authorization: Bearer {user_token}
X-User-Email: user@example.com
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 20,
  "userWalletAddress": "UserSolanaWallet123...",
  "cardId": "card-xyz" // optional
}
```

**Response (201):**
```json
{
  "topup": {
    "id": "ITOP-1736418000000-abc123",
    "userEmail": "user@example.com",
    "requestedAmount": "20.00",
    "exactAmount": "20.1024",
    "decimalCode": "1024",
    "currency": "USDC",
    "userWalletAddress": "UserSolanaWallet123...",
    "solanaWalletAddress": "KredoSolanaWallet456...",
    "topupMethod": "wallet_address",
    "status": "pending",
    "cardId": "card-xyz",
    "createdAt": 1736418000000
  }
}
```

**User Flow:**
1. User calls this API dengan amount yang diinginkan
2. System generate exact amount dengan 4-digit decimal (e.g., $20.1024)
3. User transfer EXACT amount ke `solanaWalletAddress`
4. Admin verify dan approve via admin API

---

### 2. List User's Top-Up Requests (User)

**Endpoint:** `GET /api/internal-topup`

**Headers:**
```
Authorization: Bearer {user_token}
X-User-Email: user@example.com
```

**Response (200):**
```json
{
  "topups": [
    {
      "id": "ITOP-1736418000000-abc123",
      "requestedAmount": "20.00",
      "exactAmount": "20.1024",
      "status": "pending",
      "createdAt": 1736418000000
      // ... other fields
    }
  ]
}
```

---

### 3. Issue/Approve Top-Up (Admin)

**Endpoint:** `POST /api/internal-topup/issue/{topupId}`

**Headers:**
```
X-API-Key: {ADMIN_API_KEY}
Content-Type: application/json
```

**Request Body:**
```json
{
  "transactionHash": "SolanaTransactionHash123...", // optional
  "adminNotes": "Verified Solana transfer $20.1024" // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Top-up issued successfully",
  "topup": {
    "id": "ITOP-1736418000000-abc123",
    "userEmail": "user@example.com",
    "requestedAmount": "20.00",
    "exactAmount": "20.1024",
    "status": "completed",
    "approvedAt": 1736418100000,
    "completedAt": 1736418100000,
    "transactionHash": "SolanaTransactionHash123..."
  }
}
```

**What This API Does:**
1. ✅ Approve the top-up request
2. ✅ Update card balance (+requested amount)
3. ✅ Create transaction record
4. ✅ Mark request as completed

**All in one API call!**

---

### 4. Get Specific Top-Up (Admin)

**Endpoint:** `GET /api/internal-topup/issue/{topupId}`

**Headers:**
```
X-API-Key: {ADMIN_API_KEY}
```

**Response (200):**
```json
{
  "topup": {
    "id": "ITOP-1736418000000-abc123",
    "userEmail": "user@example.com",
    "requestedAmount": "20.00",
    "exactAmount": "20.1024",
    "decimalCode": "1024",
    "solanaWalletAddress": "KredoSolanaWallet456...",
    "status": "pending",
    // ... all fields
  }
}
```

---

## 🔐 Environment Variables

Add to `.env.local`:

```env
# Kredo's Solana Wallet Address (where users send funds)
KREDO_SOLANA_WALLET_ADDRESS=YourSolanaWalletAddressHere

# Admin API Key for issuing top-ups
ADMIN_API_KEY=your-secure-admin-api-key-here
```

**Generate secure API key:**
```bash
openssl rand -hex 32
```

---

## 🧪 Testing Guide

### Test 1: Create Top-Up Request

```bash
curl -X POST http://localhost:3000/api/internal-topup \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Email: user@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 20,
    "userWalletAddress": "UserSolanaWallet123...",
    "cardId": "card-xyz"
  }'
```

**Expected:**
- Status: 201
- Response contains `exactAmount` (e.g., 20.1024)
- Response contains `decimalCode` (e.g., "1024")
- Response contains `solanaWalletAddress`

---

### Test 2: Issue Top-Up (Admin)

```bash
curl -X POST http://localhost:3000/api/internal-topup/issue/ITOP-xxx \
  -H "X-API-Key: your-admin-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionHash": "SolanaHash123...",
    "adminNotes": "Verified transfer"
  }'
```

**Expected:**
- Status: 200
- `success: true`
- `status: "completed"`
- Card balance increased by requested amount
- Transaction record created

---

### Test 3: Verify Balance Updated

```bash
# Check card balance via your existing cards API
curl http://localhost:3000/api/cards \
  -H "Authorization: Bearer {token}" \
  -H "X-User-Email: user@example.com"
```

**Expected:**
- Card balance = previous balance + requested amount

---

## 🔄 Complete Flow Example

### Step 1: User Creates Request
```bash
POST /api/internal-topup
{
  "amount": 20,
  "userWalletAddress": "UserWallet...",
  "cardId": "card-123"
}

Response:
{
  "topup": {
    "id": "ITOP-1736418000000-abc",
    "exactAmount": "20.1024",
    "solanaWalletAddress": "KredoWallet..."
  }
}
```

### Step 2: User Transfers Funds
User transfers **exactly $20.1024** to `KredoWallet...` via Solana

### Step 3: Admin Verifies & Issues
```bash
POST /api/internal-topup/issue/ITOP-1736418000000-abc
{
  "transactionHash": "SolanaHash...",
  "adminNotes": "Verified $20.1024 transfer"
}

Response:
{
  "success": true,
  "message": "Top-up issued successfully"
}
```

### Step 4: User Sees Updated Balance
Card balance: $0.00 → $20.00 ✅

---

## ⚠️ Error Handling

### 401 Unauthorized
```json
{
  "error": "Unauthorized - Invalid API key"
}
```
**Fix:** Check `ADMIN_API_KEY` in environment

### 404 Not Found
```json
{
  "error": "Top-up request not found"
}
```
**Fix:** Verify topup ID is correct

### 400 Bad Request
```json
{
  "error": "Top-up request already completed",
  "currentStatus": "completed"
}
```
**Fix:** Cannot issue already processed requests

---

## 📊 Database Verification

### Check Pending Requests
```sql
SELECT 
    id,
    exact_amount,
    decimal_code,
    status
FROM internal_topup_requests
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Verify Issued Top-Up
```sql
SELECT 
    itr.id,
    itr.exact_amount,
    itr.status,
    vc.balance as card_balance,
    t.amount as transaction_amount
FROM internal_topup_requests itr
LEFT JOIN virtual_cards vc ON vc.id = itr.card_id
LEFT JOIN transactions t ON t.card_id = itr.card_id 
    AND t.type = 'topup_internal'
    AND t.timestamp >= itr.created_at
WHERE itr.id = 'ITOP-xxx';
```

---

## 🎯 Key Features

✅ **Exact Amount Verification** - 4-digit decimal code (e.g., $20.1024)
✅ **API Key Authentication** - Secure admin endpoint
✅ **One-Call Issuance** - Approve + update balance + create transaction
✅ **Automatic Balance Update** - No manual SQL needed
✅ **Transaction Record** - Full audit trail
✅ **Error Handling** - Comprehensive error messages

---

## 📝 Notes

1. **Exact Amount:** User MUST transfer exact amount (e.g., $20.1024)
2. **Decimal Code:** The 4 digits (.1024) are unique verification code
3. **Admin API:** Protected by API key, not user token
4. **One Request = One Issuance:** Cannot issue same request twice
5. **Balance Update:** Uses `requested_amount`, not `exact_amount`

---

**Created:** 2026-01-09  
**Status:** ✅ Ready for Testing
