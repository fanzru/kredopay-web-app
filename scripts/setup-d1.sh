#!/bin/bash

# D1 Database Setup Script for KredoPay
# This script helps you create and setup D1 databases for Cloudflare deployment

set -e

echo "🚀 KredoPay D1 Database Setup"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to create database and extract ID
create_database() {
    local db_name=$1
    local env=$2
    
    echo -e "${YELLOW}Creating database: ${db_name}...${NC}"
    
    # Create database and capture output
    output=$(wrangler d1 create "$db_name" 2>&1)
    
    # Extract database_id from output
    db_id=$(echo "$output" | grep "database_id" | sed -n 's/.*database_id = "\([^"]*\)".*/\1/p')
    
    if [ -z "$db_id" ]; then
        echo -e "${RED}Failed to create database or extract ID${NC}"
        echo "$output"
        return 1
    fi
    
    echo -e "${GREEN}✓ Created: ${db_name}${NC}"
    echo -e "  Database ID: ${db_id}"
    echo ""
    
    # Return the ID
    echo "$db_id"
}

# Function to run migration
run_migration() {
    local db_name=$1
    local migration_file=$2
    local env=$3
    
    echo -e "${YELLOW}Running migration for ${db_name}...${NC}"
    
    if wrangler d1 execute "$db_name" --file="$migration_file" --env "$env"; then
        echo -e "${GREEN}✓ Migration completed for ${db_name}${NC}"
        echo ""
    else
        echo -e "${RED}✗ Migration failed for ${db_name}${NC}"
        return 1
    fi
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Error: wrangler CLI not found${NC}"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Ask user which environment to setup
echo "Which environment do you want to setup?"
echo "1) Production"
echo "2) Preview"
echo "3) Both"
read -p "Enter choice [1-3]: " env_choice

case $env_choice in
    1)
        ENVS=("production")
        ;;
    2)
        ENVS=("preview")
        ;;
    3)
        ENVS=("production" "preview")
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""

# Process each environment
for ENV in "${ENVS[@]}"; do
    echo -e "${GREEN}=== Setting up ${ENV} environment ===${NC}"
    echo ""
    
    # Determine database names
    if [ "$ENV" = "production" ]; then
        MAIN_DB="kredopay-db"
        AUTH_DB="kredopay-auth-db"
    else
        MAIN_DB="kredopay-db-preview"
        AUTH_DB="kredopay-auth-db-preview"
    fi
    
    # Create databases
    echo "Step 1: Creating databases..."
    MAIN_DB_ID=$(create_database "$MAIN_DB" "$ENV")
    AUTH_DB_ID=$(create_database "$AUTH_DB" "$ENV")
    
    # Update wrangler.toml
    echo "Step 2: Updating wrangler.toml..."
    
    if [ "$ENV" = "production" ]; then
        # Update production database IDs
        sed -i.bak "s/YOUR_PRODUCTION_DB_ID/$MAIN_DB_ID/g" wrangler.toml
        sed -i.bak "s/YOUR_PRODUCTION_AUTH_DB_ID/$AUTH_DB_ID/g" wrangler.toml
    else
        # Update preview database IDs
        sed -i.bak "s/YOUR_PREVIEW_DB_ID/$MAIN_DB_ID/g" wrangler.toml
        sed -i.bak "s/YOUR_PREVIEW_AUTH_DB_ID/$AUTH_DB_ID/g" wrangler.toml
    fi
    
    echo -e "${GREEN}✓ Updated wrangler.toml${NC}"
    echo ""
    
    # Run migrations
    echo "Step 3: Running migrations..."
    run_migration "$MAIN_DB" "./scripts/migrations/001_init_main_db.sql" "$ENV"
    run_migration "$AUTH_DB" "./scripts/migrations/002_init_auth_db.sql" "$ENV"
    
    # Verify setup
    echo "Step 4: Verifying setup..."
    echo -e "${YELLOW}Tables in ${MAIN_DB}:${NC}"
    wrangler d1 execute "$MAIN_DB" --command "SELECT name FROM sqlite_master WHERE type='table';" --env "$ENV"
    echo ""
    
    echo -e "${YELLOW}Tables in ${AUTH_DB}:${NC}"
    wrangler d1 execute "$AUTH_DB" --command "SELECT name FROM sqlite_master WHERE type='table';" --env "$ENV"
    echo ""
    
    echo -e "${GREEN}✓ ${ENV} environment setup complete!${NC}"
    echo ""
done

# Clean up backup files
rm -f wrangler.toml.bak

echo -e "${GREEN}=============================="
echo "🎉 Setup Complete!"
echo "==============================${NC}"
echo ""
echo "Next steps:"
echo "1. Review wrangler.toml to ensure database IDs are correct"
echo "2. Set environment variables in Cloudflare Pages dashboard"
echo "3. Deploy your application with: bun run pages:deploy"
echo ""
echo -e "${YELLOW}Note: Make sure to set these environment variables in Cloudflare Pages:${NC}"
echo "  - RESEND_API_KEY"
echo "  - RESEND_FROM_EMAIL"
echo "  - JWT_SECRET"
echo "  - DEV_EMAIL (optional)"
echo "  - DEV_OTP (optional)"
echo "  - NEXT_PUBLIC_SHOW_DAPP"
echo ""
