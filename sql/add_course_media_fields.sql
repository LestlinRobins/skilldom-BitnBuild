-- Add media fields to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS document_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_files TEXT[] DEFAULT '{}';

-- Create storage bucket for course media if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-media', 'course-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for course media bucket
CREATE POLICY "Allow authenticated users to upload course media" ON storage.objects
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'course-media');

CREATE POLICY "Allow public read access to course media" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'course-media');

CREATE POLICY "Allow course creators to delete their media" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'course-media' AND 
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM courses WHERE teacher_id = auth.uid()::text
  )
);

-- Update existing courses to have empty arrays for new fields
UPDATE courses 
SET 
  video_urls = '{}',
  document_urls = '{}',
  media_files = '{}'
WHERE 
  video_urls IS NULL OR 
  document_urls IS NULL OR 
  media_files IS NULL;
