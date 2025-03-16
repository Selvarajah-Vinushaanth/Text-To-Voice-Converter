-- Create text_to_speech_usage table to track usage
CREATE TABLE IF NOT EXISTS text_to_speech_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_count INTEGER NOT NULL,
  voice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  audio_url TEXT
);

-- Enable row level security
ALTER TABLE text_to_speech_usage ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own usage
DROP POLICY IF EXISTS "Users can view their own usage";
CREATE POLICY "Users can view their own usage"
  ON text_to_speech_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own usage
DROP POLICY IF EXISTS "Users can insert their own usage";
CREATE POLICY "Users can insert their own usage"
  ON text_to_speech_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add realtime
alter publication supabase_realtime add table text_to_speech_usage;
