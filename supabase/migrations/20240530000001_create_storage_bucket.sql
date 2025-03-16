-- Create a storage bucket for audio files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload files
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files');

-- Set up storage policy to allow public read access to audio files
DROP POLICY IF EXISTS "Allow public read access to audio files" ON storage.objects;
CREATE POLICY "Allow public read access to audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-files');

-- Enable realtime for the text_to_speech_usage table
-- Table already added to realtime publication in another migration