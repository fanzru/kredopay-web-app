# 🚀 Cloudflare D1 Deployment Checklist

Use this checklist when deploying KredoPay to Cloudflare Pages with D1.

## ✅ Pre-Deployment Checklist

### 1. Local Development Working
- [ ] `bun run dev` berjalan tanpa error
- [ ] Database SQLite terbuat di `./data/`
- [ ] Login flow berfungsi (test dengan `dev@kredopay.app`)
- [ ] Virtual cards bisa dibuat dan ditampilkan
- [ ] Transactions tercatat dengan benar

### 2. Environment Variables Ready
- [ ] `RESEND_API_KEY` - Get from [Resend Dashboard](https://resend.com/api-keys)
- [ ] `RESEND_FROM_EMAIL` - Format: `KredoPay <noreply@kredopay.app>`
- [ ] `JWT_SECRET` - Generate strong secret (min 32 characters)
- [ ] `DEV_EMAIL` - (Optional) For dev bypass
- [ ] `DEV_OTP` - (Optional) For dev bypass
- [ ] `NEXT_PUBLIC_SHOW_DAPP` - Set to `true` or `false`

### 3. Wrangler CLI Setup
- [ ] Wrangler installed: `npm install -g wrangler`
- [ ] Logged in: `wrangler login`

## 🗄️ D1 Database Setup

### Option A: Automated Setup (Recommended)
```bash
```

Follow the prompts to setup production and/or preview environments.

### Option B: Manual Setup

#### Production Environment
```bash
# 1. Create databases

# 2. Copy the database_id from output and update wrangler.toml
# Replace YOUR_PRODUCTION_DB_ID and YOUR_PRODUCTION_AUTH_DB_ID

# 3. Run migrations
  --file=./scripts/migrations/001_init_main_db.sql \
  --env production

  --file=./scripts/migrations/002_init_auth_db.sql \
  --env production

# 4. Verify
  --env production
```

#### Preview Environment
```bash
# 1. Create databases

# 2. Update wrangler.toml with preview database IDs

# 3. Run migrations
  --file=./scripts/migrations/001_init_main_db.sql \
  --env preview

  --file=./scripts/migrations/002_init_auth_db.sql \
  --env preview

# 4. Verify
  --env preview
```

### Verification Checklist
- [ ] Production DB created and migrated
- [ ] Preview DB created and migrated
- [ ] `wrangler.toml` updated with correct database IDs
- [ ] Tables exist in both databases (run verify commands above)

## ☁️ Cloudflare Pages Setup

### 1. Connect Repository
- [ ] Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Navigate to: Workers & Pages → Create Application → Pages → Connect to Git
- [ ] Select your GitHub repository: `kredopay/kredopay-web-app`
- [ ] Configure build settings:
  - **Framework preset**: Next.js
  - **Build command**: `bun run pages:build`
  - **Build output directory**: `.vercel/output/static`

### 2. Set Environment Variables
Go to: Pages → kredopay-web-app → Settings → Environment Variables

#### Production Variables
- [ ] `RESEND_API_KEY` = `re_xxxxx`
- [ ] `RESEND_FROM_EMAIL` = `KredoPay <noreply@kredopay.app>`
- [ ] `JWT_SECRET` = `your_production_secret_min_32_chars`
- [ ] `NEXT_PUBLIC_SHOW_DAPP` = `true`
- [ ] `DEV_EMAIL` = `dev@kredopay.app` (optional)
- [ ] `DEV_OTP` = `441234` (optional)

#### Preview Variables (Optional)
Same as production, but you can use different values for testing.

### 3. Verify wrangler.toml
- [ ] Database IDs are correct (not placeholder values)
- [ ] Both production and preview environments configured
- [ ] Bindings match: `DB` and `AUTH_DB`

## 🚀 Deployment

### First Deployment
```bash
# Build locally first to check for errors
bun run pages:build

# If build succeeds, deploy
bun run pages:deploy
```

### Subsequent Deployments
```bash
# Just deploy (will build automatically)
bun run pages:deploy

# Or push to GitHub (auto-deploys via Cloudflare Pages)
git push origin main
```

## ✅ Post-Deployment Verification

### 1. Check Deployment Status
- [ ] Go to Cloudflare Pages dashboard
- [ ] Check deployment logs for errors
- [ ] Verify build completed successfully

### 2. Test Production Site
- [ ] Visit your production URL: `https://kredopay-web-app.pages.dev`
- [ ] Test login flow with dev email
- [ ] Create a virtual card
- [ ] Check transactions
- [ ] Verify all features work

### 3. Database Verification
```bash
# Check if data is being saved
  --command "SELECT COUNT(*) as count FROM virtual_cards;" \
  --env production

  --command "SELECT COUNT(*) as count FROM otp_codes;" \
  --env production
```

### 4. Monitor Logs
```bash
# View real-time logs
wrangler pages deployment tail
```

## 🐛 Troubleshooting

### Build Fails
- [ ] Check build logs in Cloudflare dashboard
- [ ] Verify `bun run pages:build` works locally
- [ ] Check for TypeScript errors
- [ ] Ensure all dependencies are installed

### Database Connection Issues
- [ ] Verify database IDs in `wrangler.toml`
- [ ] Check bindings are correct: `DB` and `AUTH_DB`
- [ ] Ensure migrations ran successfully

### Environment Variables Not Working
- [ ] Verify variables are set in Cloudflare Pages dashboard
- [ ] Check variable names match exactly (case-sensitive)
- [ ] Redeploy after adding/changing variables

### OTP Emails Not Sending
- [ ] Verify `RESEND_API_KEY` is correct
- [ ] Check Resend dashboard for errors
- [ ] Ensure `RESEND_FROM_EMAIL` is verified in Resend
- [ ] Test with dev bypass first (`dev@kredopay.app`)

## 📊 Monitoring

### Regular Checks
- [ ] Monitor D1 database size: Cloudflare Dashboard → D1
- [ ] Check error rates: Pages → Analytics
- [ ] Review deployment logs regularly
- [ ] Monitor API response times

### Database Backups
```bash
# Backup production database
  --output=backup-$(date +%Y%m%d)-main.sql \
  --env production

  --output=backup-$(date +%Y%m%d)-auth.sql \
  --env production
```

## 🎉 Success Criteria

Deployment is successful when:
- [ ] ✅ Site is accessible at production URL
- [ ] ✅ Login flow works (OTP sent and verified)
- [ ] ✅ Virtual cards can be created
- [ ] ✅ Transactions are recorded
- [ ] ✅ Data persists across sessions
- [ ] ✅ No errors in deployment logs
- [ ] ✅ Database queries work correctly

## 📝 Notes

- **First deployment** may take 5-10 minutes
- **Subsequent deployments** are faster (2-3 minutes)
- **Preview deployments** are created automatically for PRs
- **Custom domain** can be added in Cloudflare Pages settings

## 🔗 Useful Links

- [Cloudflare Pages Dashboard](https://dash.cloudflare.com)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Resend Dashboard](https://resend.com/emails)

---

**Last Updated:** 2026-01-02
**Maintained By:** KredoPay Team
