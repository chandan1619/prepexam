# Deployment Guide - Schema Changes & Migrations

## Overview
This guide explains how to handle database schema changes and migrations when deploying to Vercel.

## Current Setup

### Build Configuration
- **Local Development**: Uses standard `npm run build` (no migrations)
- **Vercel Deployment**: Uses `npm run vercel-build` (includes migrations)
- **Prisma Client**: Singleton pattern via `src/lib/prisma.ts`

## Schema Change Workflow

### 1. Local Development
When you make schema changes locally:

```bash
# 1. Modify prisma/schema.prisma
# 2. Create and apply migration
npm run db:migrate

# 3. Test your changes locally
npm run dev
```

### 2. Production Deployment to Vercel

#### Option A: Automatic Migration (Current Setup)
The current configuration automatically runs migrations during Vercel build:

```bash
# This runs automatically on Vercel:
npm run vercel-build
# Which executes: prisma migrate deploy && prisma generate && next build
```

**Pros:**
- Automatic migration deployment
- No manual intervention needed
- Schema and app deploy together

**Cons:**
- Build fails if migration fails
- No rollback strategy
- Downtime during migration

#### Option B: Manual Migration (Recommended for Production)
For production systems, consider manual migration deployment:

1. **Deploy migrations first** (before code deployment):
```bash
# Connect to production database and run:
npx prisma migrate deploy
```

2. **Then deploy code** (migrations already applied):
```bash
# Vercel will use regular build (no migrations)
npm run build
```

### 3. Environment Variables Required

Ensure these are set in Vercel:
```env
DATABASE_URL=your_production_database_url
PRISMA_GENERATE_DATAPROXY=true
```

## Migration Strategies

### For Small Applications (Current Setup)
- Use automatic migration during build
- Acceptable for development/staging environments
- Quick and simple deployment

### For Production Applications
Consider these approaches:

#### 1. Pre-deployment Migration
```bash
# Before deploying to Vercel:
npx prisma migrate deploy --preview-feature
```

#### 2. Separate Migration Pipeline
- Use GitHub Actions or similar CI/CD
- Run migrations in a separate step
- Deploy code only after successful migration

#### 3. Blue-Green Deployment
- Deploy to staging environment first
- Test migrations thoroughly
- Switch traffic after validation

## Rollback Strategy

### If Migration Fails on Vercel:
1. **Immediate**: Revert to previous deployment
2. **Database**: Manually rollback migration if needed
3. **Code**: Fix migration issue and redeploy

### Prevention:
- Always test migrations locally first
- Use staging environment that mirrors production
- Consider migration scripts for complex changes

## Best Practices

### 1. Migration Safety
- Never drop columns directly (use deprecation)
- Add columns as nullable first
- Use transactions for complex migrations
- Test with production-like data volume

### 2. Deployment Safety
- Deploy during low-traffic periods
- Monitor application after deployment
- Have rollback plan ready
- Use feature flags for major changes

### 3. Database Backup
- Always backup before major migrations
- Test restore procedures
- Consider point-in-time recovery options

## Troubleshooting

### Build Fails with Migration Error
1. Check migration syntax
2. Verify database connectivity
3. Ensure proper permissions
4. Check for conflicting migrations

### Prisma Client Out of Sync
1. Verify `prisma generate` runs after migration
2. Check singleton client implementation
3. Clear Vercel build cache if needed

## Alternative Configurations

### If You Want to Disable Auto-Migration:
Update `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && next build"
  }
}
```

Then handle migrations separately via database management tools or CI/CD pipelines.