#!/bin/bash

# AI Free Pool - Deployment Commands Cheat Sheet
# Quick reference for common deployment commands

# ============================================
# Pre-Deployment Checks
# ============================================

# Check TypeScript errors
check_types() {
    echo "Checking TypeScript..."
    npm run check:types
}

# Check linting
check_lint() {
    echo "Checking linting..."
    npm run lint
}

# Run tests
run_tests() {
    echo "Running tests..."
    npm run test
}

# Run all checks
check_all() {
    echo "Running all checks..."
    npm run check:types && npm run lint && npm run test
}

# ============================================
# Build Commands
# ============================================

# Clean build artifacts
clean_build() {
    echo "Cleaning build artifacts..."
    npm run clean
}

# Build for production
build_production() {
    echo "Building for production..."
    npm run build
}

# Test production build
test_build() {
    echo "Testing production build..."
    npm run build && npm start
}

# ============================================
# Environment Setup
# ============================================

# Generate encryption key
generate_key() {
    echo "Generating encryption key..."
    node scripts/generate-encryption-key.js
}

# Check environment variables
check_env() {
    echo "Checking environment variables..."
    if [ -f .env.local ]; then
        echo "✓ .env.local exists"
    else
        echo "✗ .env.local not found"
    fi
}

# ============================================
# Database Commands
# ============================================

# Generate database migrations
db_generate() {
    echo "Generating database migrations..."
    npm run db:generate
}

# Apply database migrations
db_migrate() {
    echo "Applying database migrations..."
    npm run db:migrate
}

# Open database studio
db_studio() {
    echo "Opening database studio..."
    npm run db:studio
}

# ============================================
# Vercel Commands
# ============================================

# Deploy to preview
deploy_preview() {
    echo "Deploying to preview..."
    vercel
}

# Deploy to production
deploy_production() {
    echo "Deploying to production..."
    vercel --prod
}

# View deployment logs
view_logs() {
    echo "Viewing deployment logs..."
    vercel logs
}

# List deployments
list_deployments() {
    echo "Listing deployments..."
    vercel ls
}

# Rollback deployment
rollback() {
    echo "Rolling back deployment..."
    vercel rollback
}

# ============================================
# Git Commands
# ============================================

# Commit and push
commit_push() {
    echo "Committing and pushing..."
    git add .
    git commit -m "${1:-chore: update}"
    git push origin main
}

# ============================================
# Monitoring Commands
# ============================================

# Check Sentry errors
check_sentry() {
    echo "Opening Sentry dashboard..."
    open "https://sentry.io"
}

# Check Vercel analytics
check_analytics() {
    echo "Opening Vercel analytics..."
    open "https://vercel.com/dashboard"
}

# Check Google Analytics
check_ga() {
    echo "Opening Google Analytics..."
    open "https://analytics.google.com"
}

# ============================================
# Help
# ============================================

show_help() {
    cat << EOF
AI Free Pool - Deployment Commands

Pre-Deployment:
  check_types          Check TypeScript errors
  check_lint           Check linting errors
  run_tests            Run test suite
  check_all            Run all checks

Build:
  clean_build          Clean build artifacts
  build_production     Build for production
  test_build           Build and test locally

Environment:
  generate_key         Generate encryption key
  check_env            Check environment variables

Database:
  db_generate          Generate migrations
  db_migrate           Apply migrations
  db_studio            Open database studio

Vercel:
  deploy_preview       Deploy to preview
  deploy_production    Deploy to production
  view_logs            View deployment logs
  list_deployments     List all deployments
  rollback             Rollback deployment

Git:
  commit_push "msg"    Commit and push changes

Monitoring:
  check_sentry         Open Sentry dashboard
  check_analytics      Open Vercel analytics
  check_ga             Open Google Analytics

Usage:
  source .deployment-commands.sh
  check_all
  build_production
  deploy_production

EOF
}

# ============================================
# Main
# ============================================

# If script is sourced, show help
if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
    echo "Deployment commands loaded!"
    echo "Type 'show_help' for available commands"
else
    show_help
fi
