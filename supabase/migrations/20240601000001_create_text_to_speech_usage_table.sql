-- Create text_to_speech_usage table to track usage
CREATE TABLE IF NOT EXISTS public.text_to_speech_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_count INTEGER NOT NULL,
  voice TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for the text_to_speech_usage table
ALTER TABLE public.text_to_speech_usage ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own usage records
DROP POLICY IF EXISTS "Users can view their own usage records" ON public.text_to_speech_usage;
CREATE POLICY "Users can view their own usage records"
  ON public.text_to_speech_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own usage records
DROP POLICY IF EXISTS "Users can insert their own usage records" ON public.text_to_speech_usage;
CREATE POLICY "Users can insert their own usage records"
  ON public.text_to_speech_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add this table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.text_to_speech_usage;