.PHONY: help install dev build clean deploy preview pages-build pages-deploy pages-dev lint format test

# Default target
help:
	@echo "📦 KredoPay Web App - Makefile Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies with Bun"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production (Next.js)"
	@echo "  make start        - Start production server"
	@echo "  make lint         - Run ESLint"
	@echo "  make format       - Format code with Prettier (if configured)"
	@echo ""
	@echo "Cloudflare Pages:"
	@echo "  make pages-build  - Build for Cloudflare Pages"
	@echo "  make pages-deploy - Deploy to Cloudflare Pages"
	@echo "  make pages-dev    - Preview Cloudflare Pages locally"
	@echo "  make preview      - Build and preview locally"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make clean-all    - Clean everything (including node_modules)"
	@echo "  make update       - Update dependencies"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies with Bun..."
	bun install

# Development server
dev:
	@echo "🚀 Starting development server..."
	bun run dev

# Build for production (standard Next.js)
build:
	@echo "🔨 Building for production..."
	bun run build

# Start production server
start:
	@echo "▶️  Starting production server..."
	bun run start

# Lint code
lint:
	@echo "🔍 Running ESLint..."
	bun run lint

# Format code (optional - add prettier if needed)
format:
	@echo "✨ Formatting code..."
	@if command -v prettier >/dev/null 2>&1; then \
		bunx prettier --write .; \
	else \
		echo "⚠️  Prettier not found. Install with: bun add -D prettier"; \
	fi

# Build for Cloudflare Pages
pages-build:
	@echo "⚡️ Building for Cloudflare Pages..."
	bun run pages:build

# Deploy to Cloudflare Pages
pages-deploy:
	@echo "🚀 Deploying to Cloudflare Pages..."
	bun run pages:deploy

# Preview Cloudflare Pages locally
pages-dev:
	@echo "👀 Starting Cloudflare Pages preview..."
	bunx wrangler pages dev .vercel/output/static

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
	rm -rf bun.lock
	@echo "✅ Deep clean complete!"

# Update dependencies
update:
	@echo "⬆️  Updating dependencies..."
	bun update

# Quick deploy (build + deploy)
deploy: pages-build
	@echo "🚀 Deploying to Cloudflare Pages..."
	bunx wrangler pages deploy .vercel/output/static --project-name=kredopay-web-app --commit-dirty=true

# Development with clean start
dev-clean: clean install dev

# Production test (build + start)
prod-test: build start

# Check project health
health:
	@echo "🏥 Checking project health..."
	@echo ""
	@echo "📦 Bun version:"
	@bun --version
	@echo ""
	@echo "📦 Node version:"
	@node --version
	@echo ""
	@echo "📦 Dependencies status:"
	@bun pm ls 2>/dev/null | head -n 5 || echo "Run 'make install' first"
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
	@echo "Runtime: Bun $(shell bun --version)"
	@echo "Deploy: Cloudflare Pages"
	@echo ""
	@echo "🔗 URLs:"
	@echo "  Production: https://kredopay-web-app.pages.dev"
	@echo ""
