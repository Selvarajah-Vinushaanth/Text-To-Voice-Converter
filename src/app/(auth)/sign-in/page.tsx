"use client";

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import ClientNavbar from "@/components/client-navbar";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect } from "react";

interface LoginProps {
  searchParams: { message?: string };
}

export default function SignInPage({ searchParams }: LoginProps) {
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (searchParams.message) {
      const messageType = searchParams.message.toLowerCase().includes('success') ? 'success' : 'error';
      setMessage({ type: messageType, message: searchParams.message });
    }
  }, [searchParams]);

  return (
    <>
      <ClientNavbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background dark:bg-gray-900 px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border dark:border-gray-700 bg-card dark:bg-gray-800 p-6 shadow-sm">
          <form className="flex flex-col space-y-6">
            {message && (
              <FormMessage
                message={message}
              />
            )}
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight dark:text-white">Sign in</h1>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                Don't have an account?{" "}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium dark:text-gray-300">
                    Password
                  </Label>
                  <Link
                    className="text-xs text-muted-foreground dark:text-gray-400 hover:text-foreground hover:underline transition-all"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  required
                  className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <SubmitButton
              className="w-full"
              pendingText="Signing in..."
              formAction={signInAction}
            >
              Sign in
            </SubmitButton>
          </form>
        </div>
      </div>
    </>
  );
}
