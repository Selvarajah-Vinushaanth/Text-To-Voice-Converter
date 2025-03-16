import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import axios from 'axios';

export async function POST(request: Request) {
  try {
    // Get the user from the session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has an active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Parse the request body
    const { text, voice } = await request.json();

    // Validate input
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!voice) {
      return NextResponse.json({ error: "Voice is required" }, { status: 400 });
    }

    // Check character limits
    const MAX_CHARS = 4000;
    const FREE_LIMIT = 500;

    if (text.length > MAX_CHARS) {
      return NextResponse.json(
        { error: `Text exceeds the maximum limit of ${MAX_CHARS} characters` },
        { status: 400 },
      );
    }

    // Check if free tier user is exceeding their limit
    if (!subscription && text.length > FREE_LIMIT) {
      return NextResponse.json(
        {
          error: `Free tier is limited to ${FREE_LIMIT} characters. Please upgrade your plan.`,
        },
        { status: 403 },
      );
    }

    // Call TTS API to generate speech
    try {
      const url = "https://api.ttsopenai.com/uapi/v1/text-to-speech";
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": "tts-b4773c262737dcbad6c186d181843832" // Hardcoded API key
      };
      const data = {
        model: "tts-1",
        voice_id: voice,
        speed: 1,
        input: text
      };

      const response = await axios.post(url, data, { headers, responseType: 'arraybuffer' });
      console.log(response);

      const buffer = Buffer.from(response.data);

      // Store the audio file in Supabase Storage
      const fileName = `speech-${user.id}-${Date.now()}.mp3`;
      const { data: uploadData, error } = await supabase.storage
        .from("audio-files")
        .upload(fileName, buffer, {
          contentType: "audio/mpeg",
        });

      if (error) throw error;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("audio-files").getPublicUrl(fileName);

      // Record usage in the database
      await supabase.from("text_to_speech_usage").insert({
        user_id: user.id,
        character_count: text.length,
        voice: voice,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        audioUrl: publicUrl,
        message: "Speech generated successfully",
      });
    } catch (error: any) {
      console.error("TTS API Error:", error.response?.data || error.message);

      // Handle specific API errors
      if (error?.response?.status === 403) {
        return NextResponse.json(
          { error: "Access forbidden. Please check your API key or permissions." },
          { status: 403 }
        );
      }

      if (error?.response?.status === 401) {
        return NextResponse.json(
          { error: "API authentication failed. Please check your API key." },
          { status: 401 }
        );
      }

      throw error; // Let the outer catch block handle other errors
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "Failed to generate speech. Please try again later." },
      { status: 500 },
    );
  }
}
