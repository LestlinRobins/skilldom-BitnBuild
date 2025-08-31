# Database Migration Update: Enhanced Verification Status

## Updated SQL Migration Script

Run this in your Supabase SQL Editor to update the verification status constraint:

```sql
-- First, drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_verification_status_check;

-- Add the updated constraint with more status options
ALTER TABLE users
ADD CONSTRAINT users_verification_status_check
CHECK (verification_status IN ('pending', 'verified', 'partially_verified', 'failed', 'not_started'));

-- Update any existing records that might have invalid status
UPDATE users
SET verification_status = 'not_started'
WHERE verification_status NOT IN ('pending', 'verified', 'partially_verified', 'failed', 'not_started');
```

## Alternative: If you want to keep it simple for now

If you prefer to keep the original 4 status values for simplicity, use this instead:

```sql
-- Keep original constraint - no changes needed
-- Just ensure your code maps to: 'pending', 'verified', 'failed', 'not_started'
```

## Status Mapping Strategy

For now, the code will map verification results as follows:

- **High confidence (>80%)**: `'verified'`
- **Low confidence or failed**: `'failed'`
- **During processing**: `'pending'`
- **Not started**: `'not_started'`

## Future Enhancement Option

Later, you can expand to include:

- `'partially_verified'` for medium confidence (60-80%)
- More granular status tracking

This gives you flexibility to enhance the system later while keeping it simple now.
