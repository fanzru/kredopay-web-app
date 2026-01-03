# Staking Feature Setup

## Overview
Real staking functionality for $KREDO tokens with wallet integration, tier-based benefits, and reward accrual.

## Database Tables Added

### 1. `user_profiles`
Stores user wallet addresses and $KREDO balances.

```sql
CREATE TABLE user_profiles (
    user_email TEXT PRIMARY KEY,
    wallet_address TEXT,
    kredo_balance DECIMAL DEFAULT 0,
    created_at BIGINT NOT NULL,
    updated_at BIGINT
);
```

### 2. `staking_positions`
Tracks active staking positions.

```sql
CREATE TABLE staking_positions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    tier TEXT NOT NULL,
    apr DECIMAL NOT NULL,
    staked_at BIGINT NOT NULL,
    unlock_at BIGINT,
    lock_period_days INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    total_rewards_earned DECIMAL DEFAULT 0,
    last_reward_claim BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT
);
```

### 3. `staking_rewards`
Tracks individual reward accruals.

### 4. `staking_history`
Logs all staking actions (stake, unstake, claim).

## API Endpoints

### Staking
- `GET /api/staking` - Fetch user's staking data
- `POST /api/staking` - Create new staking position
- `POST /api/staking/[id]/claim` - Claim rewards
- `POST /api/staking/[id]/unstake` - Unstake position

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update user profile

## Setup Instructions

### 1. Initialize User Profile with Wallet Address

To set up a user with a wallet address and initial balance, use the profile API:

```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@kredopay.app",
    "walletAddress": "F2hgieC18MeUWaWMoyaxLSQCzS7yAjRz1HgmbGAEpump",
    "kredoBalance": 100000
  }'
```

### 2. Login to Dashboard

1. Go to `http://localhost:3000/login`
2. Enter email: `dev@kredopay.app`
3. Enter OTP: `000000` (dev bypass)
4. You'll be redirected to dashboard

### 3. Navigate to Staking Page

Go to `/dashboard/staking` to see:
- Your wallet balance (100,000 $KREDO)
- Staking tiers (Bronze, Silver, Gold, Platinum)
- Stake calculator
- Active positions (if any)

### 4. Create a Stake

1. Enter amount (e.g., 10000 for Gold tier)
2. Select lock period (0-365 days)
3. Click "Stake Now"
4. Confirm in modal

The system will:
- Deduct from your balance
- Create staking position
- Calculate APR based on tier + lock bonus
- Start accruing rewards

## Staking Tiers

| Tier | Min Stake | Base APR | Benefits |
|------|-----------|----------|----------|
| Bronze | 100 | 5% | Basic features |
| Silver | 1,000 | 10% | Up to 5 cards, 20% fee discount |
| Gold | 10,000 | 15% | Unlimited cards, 50% discount, analytics |
| Platinum | 100,000 | 25% | All benefits, API access, governance |

## Lock Period Bonuses

| Period | Bonus APR |
|--------|-----------|
| Flexible | +0% |
| 30 Days | +2% |
| 90 Days | +5% |
| 180 Days | +10% |
| 365 Days | +20% |

## Example: Gold Tier with 365-day Lock

- Stake: 10,000 $KREDO
- Base APR: 15%
- Lock Bonus: +20%
- **Total APR: 35%**
- Yearly Rewards: 3,500 $KREDO
- Monthly Rewards: ~291.67 $KREDO

## Unstaking

- **Flexible**: No penalty, instant unstake
- **Locked (before unlock_at)**: 10% penalty sent to treasury
- **Locked (after unlock_at)**: No penalty

## Reward Accrual

Rewards accrue hourly based on:
```
hourly_reward = (staked_amount * apr) / 365 / 24 / 100
```

Rewards can be claimed anytime without unstaking.

## Testing Flow

1. **Setup user**: Create profile with wallet address
2. **Login**: Use dev bypass (dev@kredopay.app / 000000)
3. **Check balance**: Should see 100,000 $KREDO
4. **Stake**: Try staking 10,000 $KREDO with 90-day lock
5. **Verify**: Check position appears in "Active Stakes"
6. **Balance**: Confirm balance reduced to 90,000 $KREDO
7. **Unstake**: Try unstaking (will have 10% penalty if before 90 days)

## Notes

- All timestamps are in milliseconds (Date.now())
- Balances are stored as DECIMAL for precision
- Wallet address is stored but not currently used for on-chain operations
- Rewards are calculated but not auto-distributed (manual claim required)
