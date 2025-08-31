# 🔧 Troubleshooting: UUID Error Fix

## Problem

Getting error: `Error: Failed to get user profile: invalid input syntax for type uuid: "miJRijFPYadrcsYj2FaYbgplVxx1"`

## Cause

Firebase UIDs are 28-character alphanumeric strings (e.g., `miJRijFPYadrcsYj2FaYbgplVxx1`), but Supabase was expecting UUID format (36-character with hyphens).

## Solution

### Option 1: Fix Your Existing Database (Recommended)

If you already created tables, run this SQL in your Supabase SQL Editor:

```sql
-- Drop existing foreign key constraints
ALTER TABLE user_reviews DROP CONSTRAINT IF EXISTS user_reviews_user_id_fkey;
ALTER TABLE user_reviews DROP CONSTRAINT IF EXISTS user_reviews_reviewer_id_fkey;

-- Alter the users table id column to TEXT
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- Alter the user_reviews foreign key columns to TEXT
ALTER TABLE user_reviews ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_reviews ALTER COLUMN reviewer_id TYPE TEXT;

-- Re-add the foreign key constraints
ALTER TABLE user_reviews ADD CONSTRAINT user_reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_reviews ADD CONSTRAINT user_reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Option 2: Drop and Recreate Tables (If No Data)

If you haven't added any important data yet:

```sql
-- Drop tables in correct order (reviews first due to foreign key)
DROP TABLE IF EXISTS user_reviews;
DROP TABLE IF EXISTS users;

-- Then run the correct schema from SUPABASE_FIREBASE_SETUP.md
-- (The schema has been updated with TEXT instead of UUID)
```

### Option 3: Create New Tables with Correct Schema

The updated schema in `SUPABASE_FIREBASE_SETUP.md` now uses:

- `id TEXT PRIMARY KEY` (instead of UUID)
- `user_id TEXT` in reviews table
- `reviewer_id TEXT` in reviews table

## Verification

After running the migration, test with:

```sql
-- This should work now
INSERT INTO users (id, name, email)
VALUES ('miJRijFPYadrcsYj2FaYbgplVxx1', 'Test User', 'test@example.com');

-- Check if it worked
SELECT * FROM users WHERE id = 'miJRijFPYadrcsYj2FaYbgplVxx1';
```

## Why This Happened

- **Firebase UIDs**: 28-character strings like `miJRijFPYadrcsYj2FaYbgplVxx1`
- **PostgreSQL UUIDs**: 36-character with hyphens like `550e8400-e29b-41d4-a716-446655440000`

Since we're using Firebase for auth, we need to store Firebase UIDs as TEXT, not UUID.

## Prevention

Always use TEXT for Firebase UIDs in PostgreSQL schemas:

```sql
id TEXT PRIMARY KEY  -- ✅ Correct
id UUID PRIMARY KEY  -- ❌ Wrong for Firebase UIDs
```
