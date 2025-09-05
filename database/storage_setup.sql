-- Storage bucket setup for projects
-- This should be run in the Supabase dashboard SQL editor or through the Storage UI

-- Create the storage bucket for course uploads (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-uploads',
  'course-uploads',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
CREATE POLICY "Anyone can view course uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'course-uploads');

CREATE POLICY "Authenticated users can upload course media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-uploads' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: The above policies assume that files are organized in folders by user ID
-- If you're using a different organization method, adjust the policies accordingly
