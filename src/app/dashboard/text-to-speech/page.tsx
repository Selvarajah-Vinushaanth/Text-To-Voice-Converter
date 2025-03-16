"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import TextToSpeechConverter from "@/components/text-to-speech-converter";
import { ClientSubscriptionCheck } from "@/components/client-subscription-check";
import Footer from "@/components/footer";

export default function TextToSpeechPage() {
  return (
    <ClientSubscriptionCheck>
      <div className="min-h-screen flex flex-col dark:bg-gray-900">
        <DashboardNavbar />
        <main className="w-full flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 dark:text-white">Text to Speech Converter</h1>
              <p className="text-muted-foreground dark:text-gray-300">
                Convert your text into natural-sounding speech using AI technology.
              </p>
            </div>

            <TextToSpeechConverter />
          </div>
        </main>
        <Footer />
      </div>
    </ClientSubscriptionCheck>
  );
}
