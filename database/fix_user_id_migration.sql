-- Migration script to update existing projects table for non-UUID user IDs
-- Run this if you already have a projects table with UUID user ID fields

-- First, drop existing constraints and indexes that depend on the UUID format
DROP INDEX IF EXISTS idx_projects_current_members;
DROP INDEX IF EXISTS idx_project_applications_applicant_id;

-- Drop the existing projects table if it exists (WARNING: This will delete all data)
-- Only run this if you're starting fresh or can afford to lose existing data
-- DROP TABLE IF EXISTS project_applications CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;

-- Alternative: If you want to preserve data, create new tables with different names
-- and migrate the data manually

-- Method 1: Complete recreation (USE WITH CAUTION - DELETES ALL DATA)
/*
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
*/

-- Method 2: Create new tables and migrate (SAFER)
-- Rename existing tables first
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE projects RENAME TO projects_backup;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_applications') THEN
        ALTER TABLE project_applications RENAME TO project_applications_backup;
    END IF;
END $$;

-- Create new projects table with TEXT user IDs
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    max_members INTEGER DEFAULT 5,
    current_members TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'completed', 'paused')),
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration VARCHAR(100),
    contact_info TEXT,
    project_links TEXT[] DEFAULT '{}',
    gallery_images TEXT[] DEFAULT '{}',
    media_files TEXT[] DEFAULT '{}',
    deadline TIMESTAMP,
    requirements TEXT,
    project_goals TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create new project_applications table
CREATE TABLE IF NOT EXISTS project_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id TEXT NOT NULL,
    message TEXT NOT NULL,
    skills_offered TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recreate indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_current_members ON projects USING GIN(current_members);
CREATE INDEX IF NOT EXISTS idx_projects_required_skills ON projects USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_project_applications_project_id ON project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_applicant_id ON project_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_project_applications_status ON project_applications(status);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Migrate data from backup tables (if you have existing data)
/*
INSERT INTO projects (
    title, description, creator_id, required_skills, max_members, current_members,
    status, category, tags, difficulty_level, estimated_duration, contact_info,
    project_links, gallery_images, media_files, deadline, requirements, 
    project_goals, created_at, updated_at
)
SELECT 
    title, description, creator_id::TEXT, required_skills, max_members, 
    array(SELECT unnest(current_members)::TEXT), status, category, tags, 
    difficulty_level, estimated_duration, contact_info, project_links, 
    gallery_images, media_files, deadline, requirements, project_goals, 
    created_at, updated_at
FROM projects_backup;
*/

-- Note: After successful migration and verification, you can drop the backup tables:
-- DROP TABLE IF EXISTS projects_backup CASCADE;
-- DROP TABLE IF EXISTS project_applications_backup CASCADE;
