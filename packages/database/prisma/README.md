# Database Seeding

This folder contains database seed scripts for development and testing.

## Seed Scripts

### 1. Main Seed Script (`seed.ts`)

Seeds the database with a dev user and all **14 published problems** that have runner test suites.

```bash
bun run db:seed
```

**What it seeds:**

- **Dev user** — `dev@reqres.site` (OAuth-only, no password, 0 XP)
- **14 published problems**

### 2. Test Users Script (`seed-test-users.ts`)

Seeds test users with email/password authentication for testing purposes.

```bash
bun run db:seed-test-users
```

**What it seeds:**

- **Admin User**
  - Email: `admin@reqres.site`
  - Password: `Admin@123`
  - Role: ADMIN
  - XP: 0

- **Test User**
  - Email: `test@reqres.site`
  - Password: `Test@123`
  - Role: USER
  - XP: 0

- **Alice**
  - Email: `alice@reqres.site`
  - Password: `Alice@123`
  - Role: USER
  - XP: 0

All users are created with:

- `emailVerified: true` (no verification needed)
- Scrypt-hashed passwords (via better-auth's `hashPassword`)
- Proper Account records for credential-based authentication

## Full Setup

To seed everything:

```bash
# Seed problems and dev user
bun run db:seed

# Seed test users with credentials
bun run db:seed-test-users
```

## Architecture

```text
problems.json          ← single source of truth (all problems, published + unpublished)
    ↓
problems-data.ts       ← filters to published slugs (useful if some problems' desc. and test suites are not ready to be published), normalizes for Prisma
    ↓
seed.ts                ← upserts dev user + creates problems (idempotent)
seed-test-users.ts     ← creates test users with hashed passwords (idempotent)
```

## Notes

- Seed scripts are **idempotent** — safe to run multiple times without duplicating data
- `problems-data.ts` forces `isPublished: true` and injects `submissionType: "EXPRESS_API"`
- All seeded users start with **0 XP** (clean slate)
- Passwords are hashed using better-auth's `hashPassword` (scrypt-based, format `salt:key`)
- The `providerId` for email/password accounts is `"credential"` (better-auth convention)
