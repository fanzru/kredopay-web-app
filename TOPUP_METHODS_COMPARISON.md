# 🔄 Feature Comparison: Deposit vs Internal Top-Up

## Overview

KredoPay sekarang memiliki **3 metode** untuk menambah balance:

| # | Method | Status | Type |
|---|--------|--------|------|
| 1 | **Deposit via Unique Code** | ✅ Active | Automated |
| 2 | **Internal Top-Up via Wallet** | 🆕 New | Manual |
| 3 | **Top-Up via MoonPay** | 🔜 Coming Soon | Automated (Future) |

---

## Detailed Comparison

### 1. Deposit via Unique Code (Existing)

```
┌─────────────────────────────────────────────────────────────┐
│ USER FLOW                                                    │
├─────────────────────────────────────────────────────────────┤
│ 1. User enters amount                                       │
│ 2. System generates unique code (DEP-XXXX-XXXX-XXXX)        │
│ 3. System generates exact amount (e.g., $100.431)           │
│ 4. User transfers exact amount to Kredo wallet              │
│ 5. User includes unique code in transaction memo            │
│ 6. System polls for transaction (every 10s)                 │
│ 7. Admin/webhook verifies transaction                       │
│ 8. Balance updated automatically                            │
└─────────────────────────────────────────────────────────────┘

✅ Pros:
  • Automated verification (with webhook)
  • Secure with unique codes
  • Real-time polling
  • No admin intervention needed (when webhook setup)

❌ Cons:
  • Requires actual crypto transfer
  • 24-hour expiry
  • User needs to have crypto wallet
  • Transaction fees apply
```

**Database Table:** `deposit_requests`

**Key Fields:**
- `unique_code` - DEP-XXXX-XXXX-XXXX
- `exact_amount` - Amount with unique decimal
- `wallet_address` - **Kredo's wallet** (where user sends)
- `expires_at` - 24 hours from creation
- `transaction_hash` - On-chain transaction

---

### 2. Internal Top-Up via Wallet (New)

```
┌─────────────────────────────────────────────────────────────┐
│ USER FLOW                                                    │
├─────────────────────────────────────────────────────────────┤
│ 1. User enters amount                                       │
│ 2. User enters their wallet address                         │
│ 3. System creates request (ITOP-XXXX)                       │
│ 4. Request marked as "Pending Approval"                     │
│ 5. Admin verifies wallet ownership (manual)                 │
│ 6. Admin approves via database                              │
│ 7. Admin issues balance via database                        │
│ 8. Balance updated, user notified                           │
└─────────────────────────────────────────────────────────────┘

✅ Pros:
  • No crypto transfer needed
  • No transaction fees
  • No expiry (pending until approved/rejected)
  • Good for internal credits, rewards, promotions
  • Admin has full control

❌ Cons:
  • Manual admin approval required
  • Slower (depends on admin availability)
  • Not instant
  • Requires trust in admin process
```

**Database Table:** `internal_topup_requests`

**Key Fields:**
- `id` - ITOP-{timestamp}-{random}
- `requested_amount` - Amount user wants
- `user_wallet_address` - **User's wallet** (for verification)
- `status` - pending → approved → completed
- `approved_by` - Admin email
- `admin_notes` - Audit trail

---

### 3. Top-Up via MoonPay (Future)

```
┌─────────────────────────────────────────────────────────────┐
│ USER FLOW (PLANNED)                                         │
├─────────────────────────────────────────────────────────────┤
│ 1. User clicks "Top-Up via MoonPay"                         │
│ 2. MoonPay widget opens                                     │
│ 3. User pays with credit/debit card                         │
│ 4. MoonPay processes payment                                │
│ 5. Webhook confirms payment                                 │
│ 6. Balance updated automatically                            │
└─────────────────────────────────────────────────────────────┘

✅ Pros (When Implemented):
  • Instant top-up
  • Credit/debit card support
  • No crypto wallet needed
  • Automated verification
  • User-friendly

❌ Cons:
  • MoonPay fees apply
  • Requires KYC
  • Integration complexity
  • Third-party dependency
```

**Database Table:** `internal_topup_requests` (same table)

**Key Fields:**
- `topup_method` - 'moonpay'
- `moonpay_transaction_id` - MoonPay's transaction ID
- Auto-approved and completed via webhook

---

## Side-by-Side Comparison Table

| Feature | Deposit (Unique Code) | Internal Top-Up | MoonPay (Future) |
|---------|----------------------|-----------------|------------------|
| **User Action** | Transfer crypto | Submit wallet | Pay with card |
| **Verification** | Automated/Webhook | Manual (Admin) | Automated |
| **Speed** | 1-5 minutes | Hours to days | Instant |
| **Fees** | Network fees | None | MoonPay fees |
| **Expiry** | 24 hours | No expiry | N/A |
| **Admin Work** | None (with webhook) | High | None |
| **Use Case** | Crypto deposits | Internal credits | Fiat on-ramp |
| **Trust Level** | Trustless | Trust admin | Trust MoonPay |
| **Crypto Required** | Yes | No | No |
| **Status Tracking** | Real-time polling | Manual refresh | Webhook |

---

## Database Schema Comparison

### deposit_requests (Existing)

```sql
CREATE TABLE deposit_requests (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    requested_amount DECIMAL NOT NULL,
    exact_amount DECIMAL NOT NULL,        -- ← Unique decimal code
    currency TEXT DEFAULT 'USDC',
    unique_code TEXT NOT NULL UNIQUE,     -- ← DEP-XXXX-XXXX-XXXX
    wallet_address TEXT,                  -- ← KREDO'S WALLET
    status TEXT DEFAULT 'pending',
    card_id TEXT REFERENCES virtual_cards(id),
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,           -- ← 24 hour expiry
    completed_at BIGINT,
    transaction_hash TEXT                 -- ← On-chain tx hash
);
```

### internal_topup_requests (New)

```sql
CREATE TABLE internal_topup_requests (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    requested_amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'USDC',
    user_wallet_address TEXT NOT NULL,    -- ← USER'S WALLET
    topup_method TEXT NOT NULL,           -- ← 'wallet_address' or 'moonpay'
    status TEXT DEFAULT 'pending',        -- ← pending/approved/rejected/completed
    card_id TEXT REFERENCES virtual_cards(id),
    created_at BIGINT NOT NULL,
    approved_at BIGINT,                   -- ← Admin approval timestamp
    approved_by TEXT,                     -- ← Admin email
    completed_at BIGINT,
    rejected_at BIGINT,                   -- ← Rejection timestamp
    rejection_reason TEXT,                -- ← Why rejected
    admin_notes TEXT,                     -- ← Audit trail
    transaction_hash TEXT,                -- ← Optional on-chain verification
    moonpay_transaction_id TEXT           -- ← For future MoonPay integration
);
```

---

## UI Comparison

### Before (Only Deposit)

```
┌─────────────────────────────────┐
│  Top Up Balance                 │
├─────────────────────────────────┤
│  Amount: [________]             │
│  Card:   [Select Card ▼]        │
│                                 │
│  [Generate Deposit Code]        │
└─────────────────────────────────┘
```

### After (3 Methods)

```
┌─────────────────────────────────────────────────────┐
│  Top Up Balance                                     │
├─────────────────────────────────────────────────────┤
│  Choose Method:                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   💳     │ │   🔗     │ │   🌙     │           │
│  │ Deposit  │ │  Wallet  │ │ MoonPay  │  [Soon]   │
│  │   Code   │ │  Top-Up  │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  [Method-specific form appears here]                │
└─────────────────────────────────────────────────────┘
```

---

## When to Use Each Method?

### Use Deposit (Unique Code) When:
- ✅ User has crypto in their wallet
- ✅ User wants trustless, automated process
- ✅ User needs quick verification (1-5 min)
- ✅ User is comfortable with blockchain transactions

### Use Internal Top-Up When:
- ✅ Admin wants to give credits/rewards
- ✅ User doesn't have crypto
- ✅ Internal testing/development
- ✅ Promotional campaigns
- ✅ Customer support refunds

### Use MoonPay When (Future):
- ✅ User wants to pay with credit/debit card
- ✅ User doesn't have crypto
- ✅ User wants instant top-up
- ✅ User is willing to complete KYC

---

## Transaction Types

After implementation, the `transactions` table will have these types:

| Type | Description | Source |
|------|-------------|--------|
| `purchase` | Card purchase | Virtual card usage |
| `refund` | Purchase refund | Merchant refund |
| `deposit` | Deposit via unique code | Existing deposit feature |
| `topup_internal` | Internal top-up | **NEW** - Internal top-up |
| `topup_moonpay` | MoonPay top-up | **FUTURE** - MoonPay |
| `staking_reward` | Staking rewards | Staking feature |

---

## Admin Workflow Comparison

### Deposit (Unique Code)
```
Admin Work: MINIMAL (with webhook)
┌─────────────────────────────────┐
│ 1. Setup webhook (one-time)     │
│ 2. Monitor for issues           │
│ 3. Handle edge cases manually   │
└─────────────────────────────────┘
```

### Internal Top-Up
```
Admin Work: HIGH (manual process)
┌─────────────────────────────────┐
│ 1. Check pending requests       │
│ 2. Verify wallet ownership      │
│ 3. Approve via SQL              │
│ 4. Issue balance via SQL        │
│ 5. Create transaction via SQL   │
│ 6. Mark completed via SQL       │
└─────────────────────────────────┘
```

### MoonPay (Future)
```
Admin Work: MINIMAL (automated)
┌─────────────────────────────────┐
│ 1. Setup MoonPay integration    │
│ 2. Configure webhook            │
│ 3. Monitor for issues           │
└─────────────────────────────────┘
```

---

## Security Comparison

| Aspect | Deposit | Internal Top-Up | MoonPay |
|--------|---------|-----------------|---------|
| **Fraud Risk** | Low | Medium | Low |
| **Verification** | On-chain | Manual | KYC + Payment |
| **Reversible** | No | Yes (admin) | Chargeback risk |
| **Audit Trail** | Blockchain | Database logs | MoonPay + DB |
| **User Trust** | Trustless | Trust admin | Trust MoonPay |

---

## Migration Path

### Phase 1: Current State ✅
- Only Deposit via Unique Code available

### Phase 2: Add Internal Top-Up 🆕
- Add `internal_topup_requests` table
- Update UI with 3 method selection
- MoonPay shows "Coming Soon"
- Admin manual approval process

### Phase 3: Implement MoonPay 🔜
- Integrate MoonPay SDK
- Setup webhook handlers
- Enable MoonPay option in UI
- Auto-approve MoonPay requests

---

## Testing Scenarios

### Deposit (Unique Code)
```
✅ Create deposit request
✅ Transfer exact amount
✅ Include unique code in memo
✅ Verify auto-completion
✅ Test expiry (24 hours)
✅ Test duplicate code prevention
```

### Internal Top-Up
```
✅ Create top-up request
✅ Admin approval flow
✅ Balance update verification
✅ Transaction record creation
✅ Rejection flow
✅ Multiple requests handling
✅ Wallet address validation
```

### MoonPay (Future)
```
🔜 Widget integration
🔜 Payment processing
🔜 Webhook handling
🔜 Auto-completion
🔜 Error handling
🔜 Refund scenarios
```

---

## Summary

### Key Differences

1. **Deposit = User sends crypto to Kredo**
   - User's crypto → Kredo's wallet
   - Automated verification
   - Trustless

2. **Internal Top-Up = Admin gives credits to user**
   - No crypto transfer
   - Manual verification
   - Trust-based

3. **MoonPay = User buys crypto with fiat**
   - Fiat → Crypto → User's balance
   - Automated via third-party
   - KYC required

### Recommendation

- **Production users**: Use Deposit (Unique Code)
- **Internal testing**: Use Internal Top-Up
- **Fiat users**: Wait for MoonPay (or use Internal Top-Up as workaround)

---

**Version:** 1.0  
**Date:** 2026-01-09  
**Related Docs:**
- [INTERNAL_TOPUP_SOLUTIONING.md](./INTERNAL_TOPUP_SOLUTIONING.md)
- [TOPUP_FEATURE.md](./TOPUP_FEATURE.md)
