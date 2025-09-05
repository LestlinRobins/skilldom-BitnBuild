-- Create projects table
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

-- Create project_applications table
CREATE TABLE IF NOT EXISTS project_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id TEXT NOT NULL,
    message TEXT NOT NULL,
    skills_offered TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Create RLS (Row Level Security) policies if needed
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Create policies (uncomment if using RLS)
-- CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
-- CREATE POLICY "Users can create their own projects" ON projects FOR INSERT WITH CHECK (creator_id = auth.uid());
-- CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (creator_id = auth.uid());
-- CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (creator_id = auth.uid());

-- CREATE POLICY "Users can view applications for their projects" ON project_applications FOR SELECT USING (
--     project_id IN (SELECT id FROM projects WHERE creator_id = auth.uid()) OR applicant_id = auth.uid()
-- );
-- CREATE POLICY "Users can create applications" ON project_applications FOR INSERT WITH CHECK (applicant_id = auth.uid());
-- CREATE POLICY "Project creators can update applications" ON project_applications FOR UPDATE USING (
--     project_id IN (SELECT id FROM projects WHERE creator_id = auth.uid())
-- );

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
