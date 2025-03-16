"use client";

import Hero from "@/components/hero";
import ClientNavbar from "@/components/client-navbar";
import Footer from "@/components/footer";
import { createClient } from "../../supabase/client";
import {
  Volume2,
  Headphones,
  Mic,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        const userResponse = await supabase.auth.getUser();
        setUser(userResponse.data.user);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <ClientNavbar />
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Powerful Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI-powered text-to-speech converter offers a wide range of features to meet your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mb-5">
                <Volume2 size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Natural Voices</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Lifelike voices that sound natural and engaging for your audience
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mb-5">
                <Mic size={32} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Multiple Voices</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from a variety of voices and languages for your projects
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mb-5">
                <Download size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Easy Export</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Download high-quality audio files
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-24 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sign up for free and start converting text to speech today
            </p>
            <div className="mt-8">
              <a 
                href="/sign-up"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your Free Account
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
