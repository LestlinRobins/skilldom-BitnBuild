-- Migration script to add or update the user_reviews table for teacher rating system

-- Create the user_reviews table if it doesn't exist
-- Note: If table exists but lacks course_id, it will be added below
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);

-- Add course_id index only if the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_reviews' AND column_name = 'course_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_user_reviews_course_id ON user_reviews(course_id);
    END IF;
END $$;

-- Add course_id column if it doesn't exist (for existing installations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_reviews' AND column_name = 'course_id'
    ) THEN
        -- First add the column as nullable with UUID type to match courses.id
        ALTER TABLE user_reviews ADD COLUMN course_id UUID;
        
        -- Add the foreign key constraint
        ALTER TABLE user_reviews ADD CONSTRAINT fk_user_reviews_course_id 
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
        
        -- Add the index for the new column
        CREATE INDEX IF NOT EXISTS idx_user_reviews_course_id ON user_reviews(course_id);
        
        -- If you want to make it NOT NULL later, you'll need to populate existing rows first
        -- For now, we'll leave it nullable to avoid breaking existing data
    END IF;
END $$;

-- Ensure unique constraint: one review per student per teacher per course
-- Only create this after course_id column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_reviews' AND column_name = 'course_id'
    ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS idx_user_reviews_unique_review 
        ON user_reviews(reviewer_id, user_id, course_id);
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_reviews' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create or replace function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_reviews_updated_at ON user_reviews;
CREATE TRIGGER update_user_reviews_updated_at
    BEFORE UPDATE ON user_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure users table has rating column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'rating'
    ) THEN
        ALTER TABLE users ADD COLUMN rating DECIMAL(2,1) DEFAULT NULL;
    END IF;
END $$;

-- Add comment
COMMENT ON TABLE user_reviews IS 'Stores student reviews and ratings for teachers after course completion';
COMMENT ON COLUMN user_reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN user_reviews.comment IS 'Optional written review';
COMMENT ON COLUMN user_reviews.course_id IS 'The specific course being reviewed';
