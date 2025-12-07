# AI Free Pool - Quick Start Guide

Get up and running with AI Free Pool in 10 minutes!

## Prerequisites

- Node.js 20+ installed
- pnpm installed (`npm install -g pnpm`)
- A Clerk account (free)
- An OpenAI API key (requires billing setup)

## Step-by-Step Setup

### 1. Clone and Install (2 minutes)

```bash
git clone <repository-url> ai-free-pool
cd ai-free-pool
pnpm install
```

### 2. Set Up Environment Variables (3 minutes)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add the following **required** keys:

#### Clerk Authentication
1. Go to [clerk.com](https://clerk.com) → Sign up → Create Application
2. Enable **Google** and **GitHub** in "Social Connections"
3. Copy keys from "API Keys" section:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### OpenAI API
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key at [API Keys](https://platform.openai.com/api-keys)
3. Set up billing (required for API access)
```env
OPENAI_API_KEY=sk-...
```

#### Arcjet Security
1. Go to [arcjet.com](https://launch.arcjet.com/Q6eLbRE) → Sign up
2. Create a site and copy the API key:
```env
ARCJET_KEY=ajkey_...
```

#### Encryption Key
Generate a random key:
```bash
openssl rand -hex 32
```
Add to `.env.local`:
```env
ENCRYPTION_KEY=<paste_generated_key>
```

### 3. Set Up Database (2 minutes)

Option A: **Quick Setup with Neon (Recommended)**
```bash
pnpm run dev  # This creates a temporary database
# Wait for the server to start, then press Ctrl+C
pnpm run neon:claim  # Makes the database persistent
```

Option B: **Use Your Own PostgreSQL**
Add your connection string to `.env.local`:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 4. Run Migrations (1 minute)

```bash
pnpm run db:migrate
```

### 5. Start Development Server (1 minute)

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Optional: Google Analytics (1 minute)

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a GA4 property
3. Copy the Measurement ID (starts with G-)
4. Add to `.env.local`:
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Verification Checklist

After setup, verify everything works:

- [ ] ✅ Homepage loads at http://localhost:3000
- [ ] ✅ Can click "Sign in" and see Clerk login page
- [ ] ✅ Google and GitHub login options appear
- [ ] ✅ Database connection works (no errors in console)
- [ ] ✅ Can navigate between pages

## Common Issues

### Issue: Clerk OAuth not working
**Solution**:
1. Check that Google/GitHub are enabled in Clerk Dashboard
2. Verify redirect URIs match exactly
3. Make sure you're using the correct environment keys

### Issue: Database connection errors
**Solution**:
1. If using Neon: Run `pnpm run neon:claim`
2. Check connection string format in `.env.local`
3. Ensure database is running (if self-hosted)

### Issue: OpenAI API errors
**Solution**:
1. Verify billing is set up in OpenAI account
2. Check API key is correct
3. Ensure you have credits available

### Issue: Port 3000 already in use
**Solution**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
PORT=3001 pnpm run dev
```

## Next Steps

Now that you're set up:

1. **Explore the codebase**: Check out `src/` directory
2. **Read the design doc**: `.kiro/specs/ai-free-pool/design.md`
3. **Start implementing**: Open `.kiro/specs/ai-free-pool/tasks.md`
4. **Run tests**: `pnpm run test`
5. **Check database**: `pnpm run db:studio`

## Development Commands

```bash
# Development
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run start            # Start production server

# Database
pnpm run db:studio        # Open database GUI
pnpm run db:generate      # Generate migration
pnpm run db:migrate       # Run migrations

# Testing
pnpm run test             # Run unit tests
pnpm run test:e2e         # Run E2E tests

# Code Quality
pnpm run lint             # Check linting
pnpm run lint:fix         # Fix linting issues
pnpm run check:types      # Type checking
```

## Getting Help

- **Configuration Issues**: See `CONFIGURATION.md`
- **Service Setup**: Check individual service documentation
- **Code Questions**: Review the design document
- **Bugs**: Open an issue on GitHub

## Production Deployment

When ready to deploy:

1. Set up production environment variables
2. Use different keys for production
3. Set up production database (Neon recommended)
4. Deploy to Vercel or your preferred platform
5. See `README.md` for detailed deployment instructions

---

**Congratulations! You're ready to start building AI Free Pool! 🎉**
