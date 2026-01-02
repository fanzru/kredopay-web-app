# OTP Authentication System

## Overview

KredoPay uses a secure OTP (One-Time Password) authentication system with email delivery via Resend and SQLite database storage.

## Features

- ✅ **Email OTP Delivery** - Beautiful branded emails sent via Resend
- ✅ **Database Storage** - OTP codes stored in SQLite with expiration tracking
- ✅ **10-Minute Expiration** - OTP codes automatically expire after 10 minutes
- ✅ **One-Time Use** - OTP codes are marked as used after successful verification
- ✅ **Auto Cleanup** - Expired OTPs are automatically cleaned up
- ✅ **Dev Bypass** - Hardcoded OTP for development testing
- ✅ **JWT Tokens** - Secure JWT tokens generated upon successful authentication

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Resend API Key (get from https://resend.com)
RESEND_API_KEY=re_your_actual_api_key

# JWT Secret (generate a random secure string)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Development Bypass (optional)
NEXT_PUBLIC_DEV_EMAIL=dev@kredopay.app
NEXT_PUBLIC_DEV_OTP=000000
```

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add your domain or use the sandbox domain for testing
4. Copy the API key to your `.env.local`

### 3. Database

The OTP database is automatically created at `data/auth.db` on first run.

## How It Works

### 1. Send OTP

**Endpoint:** `POST /api/auth/send-otp`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Process:**
1. Validates email format
2. Generates 6-digit OTP code
3. Stores OTP in database with 10-minute expiration
4. Sends email via Resend
5. Returns success response

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com"
  }
}
```

**Process:**
1. Validates OTP against database
2. Checks if OTP is not expired
3. Checks if OTP has not been used
4. Marks OTP as used
5. Generates JWT token (30-day expiration)
6. Returns token and user info

## Development Bypass

For development and testing, you can use the hardcoded credentials:

- **Email:** `dev@kredopay.app`
- **OTP:** `000000`

This bypasses the email sending but still stores the OTP in the database for consistency.

## Database Schema

```sql
CREATE TABLE otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used BOOLEAN DEFAULT 0,
  UNIQUE(email, otp_code)
);

CREATE INDEX idx_otp_email ON otp_codes(email);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);
```

## Security Features

1. **Expiration:** OTPs expire after 10 minutes
2. **One-Time Use:** OTPs can only be used once
3. **Auto Cleanup:** Old OTPs are automatically deleted
4. **Rate Limiting:** Only one active OTP per email at a time
5. **Secure Storage:** OTPs stored in local SQLite database
6. **JWT Tokens:** Secure token-based authentication

## Email Template

The OTP email includes:
- KredoPay branding
- Large, easy-to-read OTP code
- 10-minute expiration notice
- Security warning for unauthorized requests

## Testing

### Test with Real Email

1. Use your actual email address
2. Check your inbox for the OTP code
3. Enter the code within 10 minutes

### Test with Dev Bypass

1. Use email: `dev@kredopay.app`
2. Use OTP: `000000`
3. No email will be sent

## Troubleshooting

### OTP Not Received

1. Check spam/junk folder
2. Verify Resend API key is correct
3. Check Resend dashboard for delivery status
4. Ensure domain is verified in Resend (or use sandbox)

### Invalid OTP Error

1. Check if OTP has expired (10 minutes)
2. Ensure OTP hasn't been used already
3. Try requesting a new OTP

### Database Errors

1. Ensure `data/` directory exists
2. Check file permissions
3. Restart the development server

## Production Considerations

1. **Use Strong JWT Secret:** Generate a cryptographically secure random string
2. **Verify Domain:** Add and verify your domain in Resend
3. **Rate Limiting:** Implement rate limiting on OTP endpoints
4. **Monitoring:** Monitor OTP delivery rates and failures
5. **Backup:** Regular database backups
6. **HTTPS Only:** Ensure all traffic is over HTTPS

## API Reference

### OTPDatabase Class

```typescript
// Create new OTP
OTPDatabase.createOTP(email: string, otpCode: string): void

// Verify OTP
OTPDatabase.verifyOTP(email: string, otpCode: string): boolean

// Cleanup expired OTPs
OTPDatabase.cleanupExpiredOTPs(): void

// Get latest OTP (dev only)
OTPDatabase.getLatestOTP(email: string): OTPRecord | undefined
```

### Email Service

```typescript
// Send OTP email
sendOTPEmail({ email, otpCode }): Promise<{ success: boolean; error?: string }>
```

## License

Part of KredoPay Web App - See main README for license information.
