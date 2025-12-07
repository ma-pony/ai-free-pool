#!/bin/bash

# Test Production Build Script
# This script tests the production build locally before deploying

set -e  # Exit on error

echo "=========================================="
echo "AI Free Pool - Production Build Test"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo "ℹ $1"
}

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_error ".env.local file not found!"
    print_info "Please create .env.local with required environment variables"
    exit 1
fi

print_success ".env.local file found"
echo ""

# Step 1: Check TypeScript
print_info "Step 1: Checking TypeScript..."
if npm run check:types; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi
echo ""

# Step 2: Run linter
print_info "Step 2: Running linter..."
if npm run lint; then
    print_success "Linter check passed"
else
    print_error "Linter check failed"
    exit 1
fi
echo ""

# Step 3: Run tests
print_info "Step 3: Running tests..."
if npm run test; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    exit 1
fi
echo ""

# Step 4: Clean previous build
print_info "Step 4: Cleaning previous build..."
if npm run clean; then
    print_success "Clean completed"
else
    print_warning "Clean failed (this is okay if no previous build exists)"
fi
echo ""

# Step 5: Build for production
print_info "Step 5: Building for production..."
print_info "This may take a few minutes..."
if npm run build; then
    print_success "Production build completed"
else
    print_error "Production build failed"
    exit 1
fi
echo ""

# Step 6: Check build output
print_info "Step 6: Checking build output..."
if [ -d ".next" ]; then
    print_success ".next directory created"
    
    # Check for key files
    if [ -f ".next/BUILD_ID" ]; then
        BUILD_ID=$(cat .next/BUILD_ID)
        print_success "Build ID: $BUILD_ID"
    else
        print_warning "BUILD_ID file not found"
    fi
    
    if [ -d ".next/static" ]; then
        print_success "Static assets generated"
    else
        print_error "Static assets directory not found"
        exit 1
    fi
    
    if [ -d ".next/server" ]; then
        print_success "Server files generated"
    else
        print_error "Server files directory not found"
        exit 1
    fi
else
    print_error ".next directory not found"
    exit 1
fi
echo ""

# Step 7: Analyze build size
print_info "Step 7: Analyzing build size..."
if [ -f ".next/build-manifest.json" ]; then
    print_success "Build manifest found"
    
    # Get total size of .next directory
    TOTAL_SIZE=$(du -sh .next | cut -f1)
    print_info "Total build size: $TOTAL_SIZE"
    
    # Check if size is reasonable (warn if > 100MB)
    SIZE_BYTES=$(du -s .next | cut -f1)
    if [ $SIZE_BYTES -gt 102400 ]; then
        print_warning "Build size is large (> 100MB). Consider optimizing."
    else
        print_success "Build size is reasonable"
    fi
else
    print_warning "Build manifest not found"
fi
echo ""

# Step 8: Check for common issues
print_info "Step 8: Checking for common issues..."

# Check for console.log in production code
if grep -r "console\.log" src --exclude-dir=node_modules --exclude-dir=.next --exclude="*.test.*" --exclude="*.spec.*" > /dev/null 2>&1; then
    print_warning "Found console.log statements in production code"
    print_info "Consider removing or replacing with proper logging"
else
    print_success "No console.log statements found"
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO" src --exclude-dir=node_modules --exclude-dir=.next | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    print_warning "Found $TODO_COUNT TODO comments in code"
    print_info "Review and resolve before deploying"
else
    print_success "No TODO comments found"
fi

echo ""

# Step 9: Test production server (optional)
print_info "Step 9: Testing production server..."
print_info "Starting production server on port 3000..."
print_info "Press Ctrl+C to stop the server"
echo ""
print_warning "Manual testing required:"
print_info "  1. Open http://localhost:3000 in your browser"
print_info "  2. Test key features:"
print_info "     - Homepage loads"
print_info "     - Campaign list loads"
print_info "     - Campaign details load"
print_info "     - Authentication works"
print_info "     - Search works"
print_info "     - Filters work"
print_info "  3. Check browser console for errors"
print_info "  4. Check Network tab for failed requests"
echo ""
print_info "Starting server in 5 seconds..."
sleep 5

npm start

echo ""
echo "=========================================="
echo "Production Build Test Complete!"
echo "=========================================="
echo ""
print_success "All automated checks passed"
print_info "Next steps:"
print_info "  1. Review the manual testing checklist"
print_info "  2. Fix any issues found"
print_info "  3. Run this script again"
print_info "  4. Deploy to Vercel when ready"
echo ""
