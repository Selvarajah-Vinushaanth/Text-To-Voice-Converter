"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserCircle, Home, Volume2, LayoutDashboard, Mic2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="flex items-center gap-2">
            <Mic2 className="h-6 w-6 text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Voicify</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4 ml-8">
            <Link
              href="/dashboard"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === "/dashboard" ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"}`}
            >
              <span className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </span>
            </Link>

            <Link
              href="/dashboard/text-to-speech"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === "/dashboard/text-to-speech" ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"}`}
            >
              <span className="flex items-center">
                <Volume2 className="mr-2 h-4 w-4" />
                Text to Speech
              </span>
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/text-to-speech">Text to Speech</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
