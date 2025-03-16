"use client";

import Link from 'next/link';
import { createClient } from '../../supabase/client';
import { Button } from './ui/button';
import { User, UserCircle } from 'lucide-react';
import UserProfile from './user-profile';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './theme-toggle';

export default function ClientNavbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <nav className="w-full border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" prefetch className="text-xl font-bold dark:text-white">
            Logo
          </Link>
          <div className="flex gap-4 items-center">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl font-bold dark:text-white">
          Logo
        </Link>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              >
                <Button>
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-gray-700 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 