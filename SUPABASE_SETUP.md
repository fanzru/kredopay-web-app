# 🔧 Supabase Setup Guide

## Quick Setup

### 1. Environment Variables

Copy `env.example` to `.env.local` dan isi dengan credentials Supabase Anda:

```bash
cp env.example .env.local
```

Kemudian update nilai-nilai berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ebsfpsqwatekqolujimf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Cara mendapatkan credentials:**
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### 2. Database Schema

Jalankan schema SQL di Supabase SQL Editor:

1. Buka Supabase Dashboard → **SQL Editor**
2. Klik **New Query**
3. Copy isi dari `supabase.sql`
4. Paste dan klik **Run**

Schema akan membuat tables:
- `virtual_cards`
- `transactions`
- `spending_intents`
- `otp_codes`

### 3. Connection Pooling (Recommended)

Supabase SDK otomatis menggunakan connection pooling yang optimal untuk Edge Runtime. Database URLs sudah dikonfigurasi:

- **Pooled Connection (Port 6543)**: Untuk serverless/edge functions
- **Direct Connection (Port 5432)**: Untuk migrations

Tidak perlu konfigurasi tambahan - SDK sudah handle semuanya! 🎉

### 4. Cloudflare Pages Environment Variables

Set di Cloudflare Pages Dashboard → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://ebsfpsqwatekqolujimf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-production-secret-min-32-chars
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=KredoPay <noreply@kredopay.app>
```

## Testing

```bash
# Start development server
bun run dev

# Test OTP login
# Visit http://localhost:3000/login
# Use dev@kredopay.app with OTP: 000000
```

## Security Notes

⚠️ **NEVER commit `.env.local` to git**
⚠️ **NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to client-side**
✅ Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side operations
✅ Use `SUPABASE_SERVICE_ROLE_KEY` only in API routes (server-side)

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Verify all required variables are set
- Restart dev server: `bun run dev`

### Connection Issues
- Verify Supabase project is active
- Check API keys are correct
- Ensure database schema is applied

---

**Ready to deploy!** 🚀
