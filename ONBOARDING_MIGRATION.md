# Database Migration: Add Onboarding and Verification Fields

## SQL Migration Script

Run this in your Supabase SQL Editor to add the new onboarding fields:

```sql
-- Add new columns to users table for onboarding and verification
ALTER TABLE users
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS other_links TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skills_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_started' CHECK (verification_status IN ('pending', 'verified', 'failed', 'not_started')),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Create index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_skills_verified ON users(skills_verified);

-- Update existing users to have default values
UPDATE users
SET
  linkedin_url = NULL,
  github_url = NULL,
  portfolio_url = NULL,
  other_links = '{}',
  skills_verified = false,
  verification_status = 'not_started',
  onboarding_completed = true -- Set existing users as having completed onboarding
WHERE onboarding_completed IS NULL;
```

## Field Descriptions

### New Fields Added:

- **`linkedin_url`**: User's LinkedIn profile URL
- **`github_url`**: User's GitHub profile URL
- **`portfolio_url`**: User's personal website/portfolio URL
- **`other_links`**: Array of additional relevant links (behance, dribbble, etc.)
- **`skills_verified`**: Boolean indicating if skills have been AI-verified
- **`verification_status`**: Current verification status
  - `not_started`: User hasn't started verification
  - `pending`: AI verification in progress
  - `verified`: Skills successfully verified by AI
  - `failed`: AI verification failed or found inconsistencies
- **`onboarding_completed`**: Whether user has completed the onboarding flow

### Indexes Added:

- Fast queries for onboarding status
- Quick filtering by verification status
- Efficient lookups for verified users

## Notes:

- Existing users are marked as having completed onboarding to avoid forcing them through the new flow
- All new fields are nullable or have default values for backward compatibility
- Verification status uses CHECK constraint to ensure data integrity
