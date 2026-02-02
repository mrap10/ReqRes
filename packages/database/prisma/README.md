# Database Seeding

This folder contains database seed scripts for development and testing.

## Seed Scripts

### 1. Main Seed Script (`seed.ts`)

Seeds the database with problems and a basic user.

```bash
bun run db:seed
```

**What it seeds:**

- Basic user (OAuth-only, no password)
- Problems:
  - Hello Express API
  - Query Parameter Parser
  - Request Body Parser
  - In-Memory CRUD API
  - JWt Auth Middleware

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
  - XP: 500

- **Test User**
  - Email: `test@reqres.site`
  - Password: `Test@123`
  - Role: USER
  - XP: 100

- **Alice**
  - Email: `alice@reqres.site`
  - Password: `Alice@123`
  - Role: USER
  - XP: 150

All users are created with:

- `emailVerified: true` (no verification needed)
- Scrypt-hashed passwords (via better-auth's `hashPassword`)
- Proper Account records for credential-based authentication

## Full Setup

To seed everything:

```bash
# Seed problems and basic user
bun run db:seed

# Seed test users with credentials
bun run db:seed-test-users
```

## Notes

- The seed scripts are idempotent - they won't duplicate users/problems if run multiple times
- Passwords are hashed using better-auth's `hashPassword` function (scrypt-based with format `salt:key`)
- The `providerId` for email/password accounts is set to `"credential"` (better-auth convention)
- Test users are pre-verified (`emailVerified: true`) for easier testing
