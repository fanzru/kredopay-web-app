# Top-Up Feature Documentation

## Overview

The top-up feature allows users to deposit funds into their Kredo account by generating a unique deposit code, transferring funds to Kredo's wallet, and automatically crediting their balance once verified.

## How It Works

### Flow

1. **User Initiates Top-Up**
   - User clicks "Top Up" button on the Overview page
   - Enters deposit amount (minimum $1, maximum $100,000)
   - Optionally selects a specific card to credit

2. **System Generates Deposit Code**
   - System creates a unique deposit code (format: `DEP-XXXX-XXXX-XXXX`)
   - Displays Kredo wallet address
   - Deposit request expires in 24 hours

3. **User Transfers Funds**
   - User sends exact amount to the displayed wallet address
   - User includes the unique deposit code in the transaction memo/note
   - System polls for deposit status every 10 seconds

4. **System Verifies & Credits**
   - Admin/webhook verifies the transaction
   - System updates deposit status to "completed"
   - Card balance is automatically updated
   - Transaction record is created

## Database Schema

### `deposit_requests` Table

```sql
CREATE TABLE deposit_requests (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'USDC',
    unique_code TEXT NOT NULL UNIQUE,
    wallet_address TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed, failed, expired
    card_id TEXT REFERENCES virtual_cards(id) ON DELETE SET NULL,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    completed_at BIGINT,
    transaction_hash TEXT
);
```

## API Endpoints

### `POST /api/deposits`
Creates a new deposit request.

**Request:**
```json
{
  "amount": 100.00,
  "cardId": "card-123" // optional
}
```

**Response:**
```json
{
  "deposit": {
    "id": "deposit-123",
    "uniqueCode": "DEP-1234-5678-9012",
    "walletAddress": "0x...",
    "amount": "100.00",
    "status": "pending",
    "expiresAt": 1234567890
  }
}
```

### `GET /api/deposits`
Lists all deposit requests for the authenticated user.

### `GET /api/deposits/[id]`
Gets a specific deposit request.

### `PATCH /api/deposits/[id]`
Updates deposit status (typically called by webhook or admin).

**Request:**
```json
{
  "status": "completed",
  "transactionHash": "0x..."
}
```

## Configuration

### Environment Variables

Add to `.env.local`:

```env
# Kredo Wallet Address (where users send deposits)
KREDO_WALLET_ADDRESS=0xYourWalletAddressHere
```

**Important:** Replace `0xYourWalletAddressHere` with your actual wallet address where users should send deposits.

## Manual Verification Process

Currently, deposits require manual verification. To complete a deposit:

1. **Via API:**
   ```bash
   curl -X PATCH https://your-domain.com/api/deposits/{deposit_id} \
     -H "Authorization: Bearer {token}" \
     -H "X-User-Email: user@example.com" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "completed",
       "transactionHash": "0x..."
     }'
   ```

2. **Via Database:**
   - Update `deposit_requests` table
   - Set `status = 'completed'`
   - Set `completed_at = {timestamp}`
   - Set `transaction_hash = '{tx_hash}'`
   - The system will automatically update card balance

## Future Enhancements

### Automated Verification (Recommended)

For production, implement automated verification:

1. **Webhook Integration:**
   - Set up webhook endpoint: `POST /api/deposits/webhook`
   - Configure blockchain explorer or payment processor to send webhook on transaction
   - Verify transaction includes deposit code in memo
   - Automatically update deposit status

2. **Blockchain Monitoring:**
   - Monitor wallet for incoming transactions
   - Parse transaction memos for deposit codes
   - Match amounts and codes to pending deposits
   - Auto-complete verified deposits

3. **Payment Processor Integration:**
   - Integrate with payment providers (Stripe, Coinbase Commerce, etc.)
   - Use their webhook system for automatic verification
   - Support multiple payment methods

## Security Considerations

1. **Unique Codes:**
   - Codes are cryptographically random
   - Each code is unique and single-use
   - Codes expire after 24 hours

2. **Amount Verification:**
   - System verifies exact amount matches
   - Prevents partial deposits or overpayments

3. **User Verification:**
   - All API calls require authentication
   - Users can only access their own deposits
   - Deposit codes are tied to user email

4. **Expiry:**
   - Pending deposits expire after 24 hours
   - Prevents stale deposit requests
   - Users must create new request if expired

## UI Components

### TopUpModal
Located at: `components/dashboard/components/TopUpModal.tsx`

Features:
- Amount input with validation
- Card selection (optional)
- Unique code generation
- Wallet address display
- Copy-to-clipboard functionality
- Real-time status polling
- Expiry countdown

### Integration
The modal is integrated into the Overview page. Users can access it via the "Top Up" button in the balance header.

## Testing

### Test Deposit Flow

1. Create a deposit request:
   ```bash
   POST /api/deposits
   {
     "amount": 10.00
   }
   ```

2. Verify deposit code is generated

3. Simulate completion:
   ```bash
   PATCH /api/deposits/{id}
   {
     "status": "completed",
     "transactionHash": "0xtest123"
   }
   ```

4. Verify card balance is updated

5. Verify transaction record is created

## Troubleshooting

### Deposit Not Completing

1. Check deposit status in database
2. Verify transaction hash is correct
3. Ensure deposit hasn't expired
4. Check card balance was updated

### Balance Not Updating

1. Verify deposit status is "completed"
2. Check `completed_at` timestamp is set
3. Verify card exists and is active
4. Check transaction record was created

### Code Already Used

- Each deposit code can only be used once
- If code is already used, create a new deposit request
- Old codes expire after 24 hours

## Support

For issues or questions:
1. Check deposit status in database
2. Review API logs for errors
3. Verify environment variables are set
4. Ensure wallet address is correct


