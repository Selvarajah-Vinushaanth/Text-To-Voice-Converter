"use client";

import { createClient } from "../../supabase/client";
import { useEffect, useState } from "react";
import UserProfile from "./user-profile";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Mic2 } from "lucide-react";

export default function ClientNavbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <nav className="border-b border-border dark:border-gray-800 bg-background dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Mic2 className="h-6 w-6 text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Voicify</span>
            </Link>
          </div>

          <div className="flex gap-4 items-center">
            <ThemeToggle />
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button>
                    Dashboard
                  </Button>
                </Link>
                <UserProfile />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">
                    Sign in
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button>
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 