# Development Bypass Configuration

## Overview

KredoPay supports a development bypass mode that allows you to login without sending real OTP emails. This is useful for:
- Local development
- Testing
- CI/CD pipelines
- Demo environments

## Configuration

### Environment Variables

You can customize the dev bypass credentials via environment variables in your `.env.local` file:

```bash
# Development Bypass Configuration
NEXT_PUBLIC_DEV_EMAIL=dev@kredopay.app
NEXT_PUBLIC_DEV_OTP=000000
```

### How to Change Dev Credentials

1. **Copy the example file:**
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local` and change the values:**
   ```bash
   # Use your own email
   NEXT_PUBLIC_DEV_EMAIL=myemail@example.com
   
   # Use your own OTP (must be 6 digits)
   NEXT_PUBLIC_DEV_OTP=123456
   ```

3. **Restart your development server:**
   ```bash
   make dev
   # or
   bun run dev
   ```

## Usage

### Login with Dev Bypass

1. Go to the login page
2. Enter your configured dev email (e.g., `myemail@example.com`)
3. Click "Continue with Email"
4. Enter your configured dev OTP (e.g., `123456`)
5. You'll be logged in without receiving an email

### How It Works

When you submit an email for OTP:

1. **API checks if email matches dev email:**
   ```typescript
   const devEmail = process.env.NEXT_PUBLIC_DEV_EMAIL || "dev@kredopay.app";
   const devOTP = process.env.NEXT_PUBLIC_DEV_OTP || "000000";
   
   if (email.toLowerCase() === devEmail.toLowerCase()) {
     // Use hardcoded OTP, don't send email
     OTPDatabase.createOTP(email, devOTP);
     return { success: true, isDev: true };
   }
   ```

2. **OTP is stored in database** (for consistency)
3. **No email is sent** (saves API calls)
4. **You can login immediately** with the configured OTP

## Examples

### Example 1: Personal Dev Email

```bash
NEXT_PUBLIC_DEV_EMAIL=john@mycompany.com
NEXT_PUBLIC_DEV_OTP=111111
```

Login with:
- Email: `john@mycompany.com`
- OTP: `111111`

### Example 2: Team Dev Email

```bash
NEXT_PUBLIC_DEV_EMAIL=team@kredopay.dev
NEXT_PUBLIC_DEV_OTP=999999
```

Login with:
- Email: `team@kredopay.dev`
- OTP: `999999`

### Example 3: Testing Email

```bash
NEXT_PUBLIC_DEV_EMAIL=test@localhost
NEXT_PUBLIC_DEV_OTP=000000
```

Login with:
- Email: `test@localhost`
- OTP: `000000`

## Security Considerations

### Why NEXT_PUBLIC_*?

These variables are prefixed with `NEXT_PUBLIC_` which means they are:
- ✅ Available on both server and client
- ⚠️ Exposed in the browser bundle
- ⚠️ Visible in client-side code

**This is intentional for development bypass**, but:

### ⚠️ Production Warning

**DO NOT use dev bypass in production!**

For production:
1. Remove or comment out these variables
2. Use real email OTP only
3. Never commit `.env.local` to git

### Best Practices

1. **Different credentials per environment:**
   ```bash
   # .env.local (local dev)
   NEXT_PUBLIC_DEV_EMAIL=dev@localhost
   NEXT_PUBLIC_DEV_OTP=000000
   
   # .env.staging (staging)
   NEXT_PUBLIC_DEV_EMAIL=staging@kredopay.app
   NEXT_PUBLIC_DEV_OTP=111111
   
   # .env.production (production)
   # Don't set these variables!
   ```

2. **Use descriptive emails:**
   ```bash
   # Good
   NEXT_PUBLIC_DEV_EMAIL=dev-john@kredopay.app
   
   # Bad
   NEXT_PUBLIC_DEV_EMAIL=test@test.com
   ```

3. **Use unique OTPs per environment:**
   ```bash
   # Local
   NEXT_PUBLIC_DEV_OTP=000000
   
   # Staging
   NEXT_PUBLIC_DEV_OTP=111111
   
   # CI/CD
   NEXT_PUBLIC_DEV_OTP=999999
   ```

## Troubleshooting

### OTP Not Working

**Problem:** Dev OTP is not accepted

**Solutions:**
1. Check that email matches exactly (case-insensitive)
2. Verify OTP is exactly 6 digits
3. Restart development server after changing ENV
4. Check `.env.local` file exists and is loaded

### Email Not Recognized as Dev Email

**Problem:** System tries to send real email instead of using dev bypass

**Solutions:**
1. Verify `NEXT_PUBLIC_DEV_EMAIL` is set correctly
2. Check for typos in email address
3. Ensure `.env.local` is in project root
4. Restart Next.js dev server

### Environment Variables Not Loading

**Problem:** Changes to `.env.local` not taking effect

**Solutions:**
1. Restart development server completely
2. Check file is named `.env.local` (not `.env.local.txt`)
3. Verify file is in project root directory
4. Check for syntax errors in `.env.local`

## Testing

### Test Dev Bypass

```bash
# 1. Set your dev credentials
echo 'NEXT_PUBLIC_DEV_EMAIL=test@example.com' >> .env.local
echo 'NEXT_PUBLIC_DEV_OTP=123456' >> .env.local

# 2. Start dev server
make dev

# 3. Test login:
# - Go to /login
# - Enter: test@example.com
# - Enter OTP: 123456
# - Should login successfully without email
```

### Test Real Email

```bash
# 1. Use any email that's NOT your dev email
# - Go to /login
# - Enter: your-real-email@gmail.com
# - Check your inbox for OTP
# - Enter the OTP from email
# - Should login successfully with real email
```

## API Response

When using dev bypass, the API returns:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "isDev": true
}
```

The `isDev: true` flag indicates dev bypass was used.

## Related Files

- `/app/api/auth/send-otp/route.ts` - Handles dev bypass logic
- `/app/api/auth/verify-otp/route.ts` - Verifies OTP (same for dev and real)
- `/lib/db-otp.ts` - Stores OTP in database (same for dev and real)
- `/components/auth/LoginPage.tsx` - Login UI

## FAQ

**Q: Can I have multiple dev emails?**
A: No, only one dev email is supported. For multiple users, use real emails.

**Q: Does dev bypass work in production?**
A: Yes, but **you should never use it in production** for security reasons.

**Q: Can I use dev bypass with any email format?**
A: Yes, as long as it matches the configured `NEXT_PUBLIC_DEV_EMAIL`.

**Q: Is the dev OTP stored in the database?**
A: Yes, for consistency with real OTPs. It follows the same flow.

**Q: Can I change dev credentials without restarting?**
A: No, you must restart the Next.js development server for ENV changes to take effect.

## Summary

- ✅ Dev bypass is **configurable via ENV variables**
- ✅ Change `NEXT_PUBLIC_DEV_EMAIL` to use your own email
- ✅ Change `NEXT_PUBLIC_DEV_OTP` to use your own 6-digit code
- ✅ Restart server after changing ENV
- ⚠️ **Never use in production**
- ✅ Perfect for development and testing

---

For more information, see:
- [OTP_AUTHENTICATION.md](./OTP_AUTHENTICATION.md) - Full OTP system documentation
- [env.example](./env.example) - Environment variables template
