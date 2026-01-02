.PHONY: help install dev build clean deploy re-deploy preview pages-build pages-deploy pages-dev lint format test db-push db-generate db-studio db-migrate set-secret list-secrets delete-secret

# Default target
help:
	@echo "📦 KredoPay Web App - Makefile Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies with pnpm"
	@echo "  make dev          - Start development server (use PORT=3001 for custom port)"
	@echo "  make build        - Build for production (Next.js)"
	@echo "  make start        - Start production server"
	@echo "  make lint         - Run ESLint"
	@echo "  make format       - Format code with Prettier (if configured)"
	@echo ""
	@echo "Database (Drizzle):"
	@echo "  make db-push      - Push schema to database"
	@echo "  make db-generate  - Generate migration files"
	@echo "  make db-studio    - Open Drizzle Studio (DB GUI)"
	@echo "  make db-migrate   - Apply schema via SQL file"
	@echo ""
	@echo "Cloudflare Pages:"
	@echo "  make pages-build  - Build for Cloudflare Pages"
	@echo "  make pages-deploy - Deploy to Cloudflare Pages"
	@echo "  make pages-dev    - Preview Cloudflare Pages locally"
	@echo "  make preview      - Build and preview locally"
	@echo "  make deploy       - Quick deploy (build + deploy)"
	@echo "  make re-deploy    - Clean build and re-deploy (fix missing secrets)"
	@echo ""
	@echo "Cloudflare Secrets:"
	@echo "  make set-secret SECRET_NAME=NAME    - Set a secret (interactive)"
	@echo "  make list-secrets                   - List all secrets"
	@echo "  make delete-secret SECRET_NAME=NAME - Delete a secret"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make clean-all    - Clean everything (including node_modules)"
	@echo "  make update       - Update dependencies"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies with pnpm..."
	pnpm install

# Development server
# Usage: make dev [PORT=3001]
dev:
	@echo "🚀 Starting development server..."
	@if [ -n "$(PORT)" ]; then \
		echo "📡 Port: $(PORT)"; \
		PORT=$(PORT) pnpm run dev; \
	else \
		pnpm run dev; \
	fi

# Build for production (standard Next.js)
build:
	@echo "🔨 Building for production..."
	pnpm run build

# Start production server
start:
	@echo "▶️  Starting production server..."
	pnpm run start

# Lint code
lint:
	@echo "🔍 Running ESLint..."
	pnpm run lint

# Format code (optional - add prettier if needed)
format:
	@echo "✨ Formatting code..."
	@if command -v prettier >/dev/null 2>&1; then \
		pnpm exec prettier --write .; \
	else \
		echo "⚠️  Prettier not found. Install with: pnpm add -D prettier"; \
	fi

# Build for Cloudflare Pages
pages-build:
	@echo "⚡️ Building for Cloudflare Pages..."
	pnpm run pages:build

# Deploy to Cloudflare Pages
pages-deploy:
	@echo "🚀 Deploying to Cloudflare Pages..."
	pnpm run pages:deploy

# Preview Cloudflare Pages locally
pages-dev:
	@echo "👀 Starting Cloudflare Pages preview..."
	pnpm exec wrangler pages dev .vercel/output/static

# Build and preview locally
preview: pages-build pages-dev

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -rf .vercel
	rm -rf out
	@echo "✅ Clean complete!"

# Clean everything including node_modules
clean-all: clean
	@echo "🧹 Cleaning node_modules..."
	rm -rf node_modules
	rm -rf package-lock.json
	rm -rf pnpm-lock.yaml
	rm -rf bun.lock
	@echo "✅ Deep clean complete!"

# Update dependencies
update:
	@echo "⬆️  Updating dependencies..."
	pnpm update

# Quick deploy (build + deploy)
deploy: pages-build
	@echo "🚀 Deploying to Cloudflare Pages..."
	pnpm exec wrangler pages deploy .vercel/output/static --project-name=kredopay-web-app --commit-dirty=true

# Re-deploy: Clean build and deploy (useful when secrets are missing)
re-deploy: clean pages-build
	@echo "🔄 Re-deploying to Cloudflare Pages..."
	@echo "📦 Building fresh..."
	@echo "🚀 Deploying..."
	pnpm exec wrangler pages deploy .vercel/output/static --project-name=kredopay-web-app --commit-dirty=true
	@echo "✅ Re-deploy complete!"
	@echo ""
	@echo "💡 If secrets are missing, set them with:"
	@echo "   make set-secret SECRET_NAME=YOUR_SECRET_NAME"

# Set Cloudflare Pages secret
set-secret:
	@if [ -z "$(SECRET_NAME)" ]; then \
		echo "❌ Error: SECRET_NAME is required"; \
		echo "Usage: make set-secret SECRET_NAME=YOUR_SECRET_NAME"; \
		exit 1; \
	fi
	@echo "🔐 Setting secret: $(SECRET_NAME)"
	@echo "📝 Enter the secret value (will be hidden):"
	@pnpm exec wrangler pages secret put $(SECRET_NAME) --project-name=kredopay-web-app
	@echo "✅ Secret $(SECRET_NAME) has been set!"

# List Cloudflare Pages secrets
list-secrets:
	@echo "🔐 Listing Cloudflare Pages secrets..."
	@pnpm exec wrangler pages secret list --project-name=kredopay-web-app || echo "⚠️  Could not list secrets. Make sure you're authenticated."

# Delete Cloudflare Pages secret
delete-secret:
	@if [ -z "$(SECRET_NAME)" ]; then \
		echo "❌ Error: SECRET_NAME is required"; \
		echo "Usage: make delete-secret SECRET_NAME=YOUR_SECRET_NAME"; \
		exit 1; \
	fi
	@echo "🗑️  Deleting secret: $(SECRET_NAME)"
	@pnpm exec wrangler pages secret delete $(SECRET_NAME) --project-name=kredopay-web-app
	@echo "✅ Secret $(SECRET_NAME) has been deleted!"

# Development with clean start
dev-clean: clean install dev

# Production test (build + start)
prod-test: build start

# Check project health
health:
	@echo "🏥 Checking project health..."
	@echo ""
	@echo "📦 pnpm version:"
	@pnpm --version
	@echo ""
	@echo "📦 Node version:"
	@node --version
	@echo ""
	@echo "📦 Dependencies status:"
	@pnpm list --depth=0 2>/dev/null | head -n 10 || echo "Run 'make install' first"
	@echo ""
	@echo "✅ Health check complete!"

# Git shortcuts
git-status:
	@git status

git-add:
	@git add .

git-commit:
	@read -p "Commit message: " msg; \
	git commit -m "$$msg"

git-push:
	@git push

# Quick commit and deploy
quick-deploy: git-add git-commit git-push
	@echo "🚀 Changes pushed! Cloudflare Pages will auto-deploy."

# Show project info
info:
	@echo "📊 Project Information"
	@echo ""
	@echo "Name: kredopay-web-app"
	@echo "Framework: Next.js 16.1.1"
	@echo "Runtime: Node.js $(shell node --version)"
	@echo "Package Manager: pnpm $(shell pnpm --version)"
	@echo "Deploy: Cloudflare Pages"
	@echo ""
	@echo "🔗 URLs:"
	@echo "  Production: https://kredopay-web-app.pages.dev"
	@echo ""

cfd:
	git add .
	git commit -m "feat: for deploy"
	git push
# Database Migration Commands
db-push:
	@echo "🗄️  Pushing schema to database..."
	@if [ -f .env.local ]; then \
		set -a; \
		. .env.local; \
		set +a; \
		pnpm run db:push; \
	else \
		echo "⚠️  .env.local not found. Please create it first."; \
		exit 1; \
	fi

db-generate:
	@echo "📝 Generating migration files..."
	pnpm run db:generate

db-studio:
	@echo "🎨 Opening Drizzle Studio..."
	@if [ -f .env.local ]; then \
		set -a; \
		. .env.local; \
		set +a; \
		pnpm run db:studio; \
	else \
		echo "⚠️  .env.local not found. Please create it first."; \
		exit 1; \
	fi

db-migrate:
	@echo "�� Applying schema via SQL..."
	@if [ ! -f drizzle-schema.sql ]; then \
		echo "⚠️  drizzle-schema.sql not found!"; \
		exit 1; \
	fi
	@if [ -f .env.local ]; then \
		set -a; \
		. .env.local; \
		set +a; \
		if [ -n "$$DATABASE_URL" ] || [ -n "$$DIRECT_URL" ]; then \
			PGPASSWORD="pZ5bBi2bz2HHvN13" psql -h aws-1-ap-south-1.pooler.supabase.com -p 5432 -U postgres.ebsfpsqwatekqolujimf -d postgres -f drizzle-schema.sql && \
			echo "✅ Schema applied successfully!"; \
		else \
			echo "⚠️  DATABASE_URL or DIRECT_URL not found in .env.local"; \
			exit 1; \
		fi \
	else \
		echo "⚠️  .env.local not found. Please create it first."; \
		exit 1; \
	fi
