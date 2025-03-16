"use client";

import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/client";
import { InfoIcon, UserCircle, Volume2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ClientSubscriptionCheck } from "@/components/client-subscription-check";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        
        if (!data.user) {
          router.push("/sign-in");
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-gray-100">Loading...</div>;
  }

  if (!user) {
    return null; // We'll handle redirection in the useEffect
  }

  return (
    <ClientSubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
            <div className="bg-secondary/50 dark:bg-gray-800/50 text-sm p-3 px-4 rounded-lg text-muted-foreground dark:text-gray-300 flex gap-2 items-center">
              <InfoIcon size="14" className="dark:text-gray-400" />
              <span>
                Welcome to your dashboard. Access all your tools and features
                here.
              </span>
            </div>
          </header>

          {/* Quick Actions Section */}
          <section className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:bg-gray-800 border-blue-100 dark:border-blue-900/50">
              <CardHeader>
                <CardTitle className="dark:text-white">Text to Speech Converter</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Convert your text into natural-sounding speech using AI
                  technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <Volume2 size={64} className="text-blue-500 dark:text-blue-400" />
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/dashboard/text-to-speech">
                    Go to Converter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* User Profile Card */}
            <Card className="dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">User Profile</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <UserCircle size={48} className="text-primary dark:text-blue-400" />
                  <div>
                    <h3 className="font-semibold dark:text-white">
                      {user.user_metadata?.full_name || user.email}
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 dark:bg-gray-700/50 rounded-lg p-4 overflow-hidden">
                  <div className="text-sm">
                    <div className="flex justify-between py-1">
                      <span className="font-medium dark:text-gray-200">Account Type:</span>
                      <span className="dark:text-gray-300">Free</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-medium dark:text-gray-200">Status:</span>
                      <span className="text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </ClientSubscriptionCheck>
  );
}
