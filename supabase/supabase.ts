import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fsrqdxqskxzqvzzepmsm.supabase.co" || "";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcnFkeHFza3h6cXZ6emVwbXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MzIwNzAsImV4cCI6MjA1NzUwODA3MH0.uQlENqaiyVRYuw61kZdcjeiTpNybkdEen71MIm4_pTM" || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
