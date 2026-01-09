# 📝 Internal Top-Up Feature - Quick Summary

## 🎯 What We're Building

Menambahkan **2 metode top-up baru** di KredoPay:

1. **🔗 Internal Top-Up via Wallet Address**
   - User submit wallet address mereka
   - Admin manually verify & approve via database
   - Balance di-issue manual via SQL queries
   
2. **🌙 Top-Up via MoonPay (Placeholder)**
   - UI placeholder dengan "Coming Soon" badge
   - Future integration untuk instant top-up

---

## 📊 Database Changes

### New Table: `internal_topup_requests`

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT (PK) | Format: `ITOP-{timestamp}-{random}` |
| `user_email` | TEXT | User's email |
| `requested_amount` | DECIMAL | Amount user wants to top-up |
| `currency` | TEXT | Default: 'USDC' |
| `user_wallet_address` | TEXT | User's wallet address |
| `topup_method` | TEXT | 'wallet_address' or 'moonpay' |
| `status` | TEXT | 'pending', 'approved', 'rejected', 'completed' |
| `card_id` | TEXT (FK) | Optional: specific card to credit |
| `created_at` | BIGINT | Request creation timestamp |
| `approved_at` | BIGINT | When admin approved |
| `approved_by` | TEXT | Admin email who approved |
| `completed_at` | BIGINT | When balance was issued |
| `rejected_at` | BIGINT | When request was rejected |
| `rejection_reason` | TEXT | Why it was rejected |
| `admin_notes` | TEXT | Internal admin notes |
| `transaction_hash` | TEXT | Optional: on-chain tx hash |
| `moonpay_transaction_id` | TEXT | For future MoonPay integration |

---

## 🔄 User Flow (Wallet Address Method)

```
1. User clicks "Top Up" → Modal shows 3 options
   ├─ Deposit via Unique Code (existing)
   ├─ Internal Top-Up via Wallet ← NEW
   └─ Top-Up via MoonPay (Coming Soon)

2. User selects "Internal Top-Up via Wallet"
   ├─ Enter amount ($1 - $100,000)
   ├─ Enter wallet address
   └─ Optional: Select specific card

3. User clicks "Submit Request"
   └─ Record created in DB with status='pending'

4. User sees confirmation
   └─ "Request ID: ITOP-xxx... | Status: Pending Approval"

5. Admin manually verifies (via database)
   ├─ Check wallet address validity
   ├─ Verify user legitimacy
   └─ UPDATE status='approved'

6. Admin issues balance (via database)
   ├─ UPDATE virtual_cards SET balance = balance + amount
   ├─ INSERT INTO transactions (type='topup_internal')
   └─ UPDATE internal_topup_requests SET status='completed'

7. User sees updated balance
   └─ Balance refreshed automatically
```

---

## 🛠️ Files to Create

### 1. Database Migration
```
migrations/add-internal-topup-table.sql
```

### 2. API Endpoints
```
app/api/internal-topup/route.ts          (POST, GET)
app/api/internal-topup/[id]/route.ts     (GET)
```

### 3. Frontend Components
```
components/dashboard/components/InternalTopupRequestItem.tsx
components/dashboard/hooks/useInternalTopups.ts
```

### 4. Schema Update
```
lib/schema.ts  (add internalTopupRequests table)
```

### 5. UI Updates
```
components/dashboard/components/TopUpModal.tsx  (add method selection)
components/dashboard/pages/Overview.tsx         (add internal topup section)
```

---

## 📋 Admin Manual Process

### Quick Steps:

```sql
-- 1. View pending requests
SELECT * FROM internal_topup_requests WHERE status='pending';

-- 2. Approve request
UPDATE internal_topup_requests 
SET status='approved', approved_at=..., approved_by='admin@...'
WHERE id='ITOP-xxx';

-- 3. Issue balance
UPDATE virtual_cards 
SET balance = balance + 100.00 
WHERE id='card-xxx';

-- 4. Create transaction
INSERT INTO transactions (...) VALUES (...);

-- 5. Mark completed
UPDATE internal_topup_requests 
SET status='completed', completed_at=...
WHERE id='ITOP-xxx';
```

**Full queries:** See `INTERNAL_TOPUP_DB_QUERIES.md`

---

## 🎨 UI/UX Changes

### Top-Up Modal (Updated)

**Before:**
```
┌─────────────────────────────────┐
│  Top Up Balance                 │
├─────────────────────────────────┤
│  [Amount Input]                 │
│  [Card Selection]               │
│  [Generate Deposit Code]        │
└─────────────────────────────────┘
```

**After:**
```
┌─────────────────────────────────┐
│  Top Up Balance                 │
├─────────────────────────────────┤
│  Choose Method:                 │
│  ┌───┐ ┌───┐ ┌───┐             │
│  │💳 │ │🔗 │ │🌙 │             │
│  │Dep│ │Wal│ │Moon│ Soon       │
│  └───┘ └───┘ └───┘             │
│                                 │
│  [Amount Input]                 │
│  [Wallet Address] ← NEW         │
│  [Card Selection]               │
│  [Submit Request]               │
└─────────────────────────────────┘
```

### Dashboard Overview (New Section)

```
┌─────────────────────────────────┐
│  Internal Top-Up Requests       │
├─────────────────────────────────┤
│  ITOP-xxx... | $100.00          │
│  Wallet: 0x1234...5678          │
│  Status: Pending Approval       │
├─────────────────────────────────┤
│  ITOP-yyy... | $50.00           │
│  Wallet: 0xabcd...efgh          │
│  Status: Completed ✓            │
└─────────────────────────────────┘
```

---

## ✅ Implementation Checklist

### Phase 1: Database
- [ ] Create migration file
- [ ] Run migration on dev database
- [ ] Update `lib/schema.ts`
- [ ] Test schema with sample data

### Phase 2: Backend
- [ ] Create `/api/internal-topup` endpoint (POST, GET)
- [ ] Create `/api/internal-topup/[id]` endpoint (GET)
- [ ] Add validation logic
- [ ] Test API endpoints with Postman/curl

### Phase 3: Frontend
- [ ] Create `InternalTopupRequestItem` component
- [ ] Create `useInternalTopups` hook
- [ ] Update `TopUpModal` with method selection
- [ ] Update `Overview` page with new section
- [ ] Test UI flow end-to-end

### Phase 4: Testing
- [ ] Test create request flow
- [ ] Test admin approval process (manual DB)
- [ ] Test balance update
- [ ] Test transaction creation
- [ ] Test rejection flow
- [ ] Test MoonPay placeholder

### Phase 5: Documentation
- [x] Main solutioning doc
- [x] DB queries reference
- [x] Quick summary
- [ ] Update README.md

### Phase 6: Deployment
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor for errors

---

## 🔐 Security Notes

- ✅ Wallet address validation (basic format check)
- ✅ Amount limits: $1 - $100,000
- ✅ User authentication required (JWT token)
- ✅ Users can only view their own requests
- ✅ Admin manual approval prevents fraud
- ✅ Audit trail with timestamps and admin notes

---

## 📊 Success Metrics

After implementation, track:
- Number of internal top-up requests per day
- Average approval time
- Approval rate vs rejection rate
- Total value processed
- User satisfaction (via feedback)

---

## 🚀 Future Enhancements

### Short-term (1-2 months)
- [ ] Email notifications for status changes
- [ ] Admin web panel for approvals (no DB access needed)
- [ ] Wallet ownership verification (sign message)

### Mid-term (3-6 months)
- [ ] MoonPay integration (full implementation)
- [ ] Auto-approval for trusted users
- [ ] Batch processing for admins

### Long-term (6+ months)
- [ ] KYC integration
- [ ] Multi-currency support
- [ ] Tiered limits based on user verification level

---

## 📞 Support

### For Users
- Check request status on dashboard
- Contact support if pending > 24 hours
- Ensure wallet address is correct before submitting

### For Admins
- Use `INTERNAL_TOPUP_DB_QUERIES.md` for SQL commands
- Always verify wallet before approving
- Add admin notes for audit trail
- Follow 6-step approval process

---

## 📚 Related Documentation

1. **[INTERNAL_TOPUP_SOLUTIONING.md](./INTERNAL_TOPUP_SOLUTIONING.md)**
   - Complete technical specification
   - Detailed flows and diagrams
   - API documentation

2. **[INTERNAL_TOPUP_DB_QUERIES.md](./INTERNAL_TOPUP_DB_QUERIES.md)**
   - SQL query reference for admins
   - Approval process step-by-step
   - Monitoring and audit queries

3. **[TOPUP_FEATURE.md](./TOPUP_FEATURE.md)**
   - Existing deposit feature (unique code method)

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - Overall database architecture

---

## 🎯 Key Differences from Existing Deposit Feature

| Feature | Existing Deposit | Internal Top-Up |
|---------|------------------|-----------------|
| **Method** | Unique code + exact amount | Wallet address |
| **Verification** | Auto (polling) | Manual (admin) |
| **Expiry** | 24 hours | No expiry |
| **User Action** | Transfer to Kredo wallet | Submit wallet address |
| **Admin Action** | None (auto) | Manual approval + issuance |
| **Use Case** | Crypto deposits | Internal credits, rewards |

---

**Version:** 1.0  
**Date:** 2026-01-09  
**Status:** ✅ Ready for Implementation  
**Estimated Time:** 2-3 days for full implementation
