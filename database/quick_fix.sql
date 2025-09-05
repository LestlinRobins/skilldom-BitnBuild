-- Quick fix for UUID user ID issue
-- Run this in your Supabase SQL editor

-- Drop existing tables if they exist (THIS WILL DELETE ALL DATA)
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Create projects table with TEXT user IDs (compatible with Firebase Auth)
CREATE TABLE projects (
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

-- Create project_applications table
CREATE TABLE project_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id TEXT NOT NULL,
    message TEXT NOT NULL,
    skills_offered TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_projects_creator_id ON projects(creator_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_current_members ON projects USING GIN(current_members);
CREATE INDEX idx_projects_required_skills ON projects USING GIN(required_skills);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);

CREATE INDEX idx_project_applications_project_id ON project_applications(project_id);
CREATE INDEX idx_project_applications_applicant_id ON project_applications(applicant_id);
CREATE INDEX idx_project_applications_status ON project_applications(status);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
