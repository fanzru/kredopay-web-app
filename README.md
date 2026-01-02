# KredoPay Web App

A Next.js-based web application for KredoPay - Zero-Knowledge Financial Infrastructure.

## 🚀 Quick Start

### Prerequisites
- Bun v1.2.22 or higher
- Node.js (for compatibility)

### Local Development

1. **Install dependencies:**
```bash
bun install
```

2. **Setup environment variables:**
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

3. **Run development server:**
```bash
bun run dev
# or
make dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

The database (SQLite) will be automatically created in `./data/` directory on first run.

## 📚 Documentation

- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database setup guide (SQLite + D1)
- **[DASHBOARD_IMPLEMENTATION.md](./DASHBOARD_IMPLEMENTATION.md)** - Dashboard features documentation
- **[OTP_AUTHENTICATION.md](./OTP_AUTHENTICATION.md)** - OTP authentication flow
- **[DEV_BYPASS.md](./DEV_BYPASS.md)** - Development bypass configuration
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide

## 🗄️ Database

This project uses a **dual-database approach**:

- **Local Development**: SQLite (`./data/kredo.db` and `./data/auth.db`)
- **Production/Preview**: Cloudflare D1

### Local Setup
Database files are automatically created when you run the dev server. No additional setup needed!

### Cloudflare D1 Setup
For production deployment, see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

Quick setup:
```bash
# Run automated setup script
```

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (local) / Cloudflare D1 (production)
- **Authentication**: Email OTP with JWT
- **Email**: Resend
- **Deployment**: Cloudflare Pages

## 📦 Available Scripts

```bash
# Development
bun run dev              # Start dev server
make dev                 # Start dev server with Makefile

# Build
bun run build            # Build for production
bun run pages:build      # Build for Cloudflare Pages

# Deploy
bun run pages:deploy     # Deploy to Cloudflare Pages

# Lint
bun run lint             # Run ESLint
```

## 🌍 Environment Variables

Create a `.env.local` file based on `env.example`:

```env
# Resend Configuration
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=KredoPay <noreply@kredopay.app>

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Development Bypass (optional)
DEV_EMAIL=dev@kredopay.app
DEV_OTP=441234

# Feature Flags
NEXT_PUBLIC_SHOW_DAPP=true
```

## 🚢 Deployment

### Cloudflare Pages

1. **Setup D1 Databases:**
```bash
```

2. **Configure Environment Variables:**
Add all variables from `.env.local` to Cloudflare Pages dashboard.

3. **Deploy:**
```bash
bun run pages:deploy
```

### Vercel (Alternative)

While this project is optimized for Cloudflare Pages, you can also deploy to Vercel:

```bash
vercel deploy
```

Note: You'll need to adjust database configuration for Vercel deployment.

## 🔐 Security

- Never commit `.env.local` or `data/*.db` files
- Rotate `JWT_SECRET` in production
- Use strong API keys from Resend
- Limit database access to authorized accounts only

## 📁 Project Structure

```
kredopay-web-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── login/             # Login page
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── db.ts             # Main database
│   ├── db-otp.ts         # OTP database
│   └── db-adapter.ts     # Database adapter (SQLite/D1)
├── scripts/               # Utility scripts
│   ├── migrations/        # Database migrations
├── data/                  # Local SQLite databases (gitignored)
└── public/               # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🔗 Links

- [KredoPay Website](https://kredopay.app)
- [Kredo SDK](https://github.com/kredopay/kredo-sdk)
- [Documentation](https://docs.kredopay.app)

---

Built with ❤️ by the KredoPay team

