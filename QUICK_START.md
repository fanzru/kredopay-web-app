# Quick Start - Dev Login

## TL;DR

Want to login without email? Add to your `.env.local`:

```bash
DEV_EMAIL=dev@kredopay.app
DEV_OTP=441234
```

Then login with:
- Email: `dev@kredopay.app`
- OTP: `441234`

## Change Dev Credentials

Edit `.env.local`:

```bash
# Use your own email and OTP
DEV_EMAIL=myemail@example.com
DEV_OTP=123456
```

Restart server:

```bash
make dev
```

Login with your custom credentials!

## That's it! 🎉

For more details, see [DEV_BYPASS.md](./DEV_BYPASS.md)
