"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import TextToSpeechConverter from "@/components/text-to-speech-converter";
import { ClientSubscriptionCheck } from "@/components/client-subscription-check";

export default function TextToSpeechPage() {
  return (
    <ClientSubscriptionCheck>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Text to Speech Converter</h1>
          <p className="text-muted-foreground">
            Convert your text into natural-sounding speech using AI technology.
          </p>
        </div>

        <TextToSpeechConverter />
      </main>
    </ClientSubscriptionCheck>
  );
}
