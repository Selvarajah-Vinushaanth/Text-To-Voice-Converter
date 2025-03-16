import Link from 'next/link';
import { Twitter, Linkedin, Github, Mic2 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <Mic2 className="h-6 w-6 text-indigo-500 dark:text-indigo-400" strokeWidth={1.5} />
            <span className="text-xl font-semibold text-gray-800 dark:text-white">Voicify</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            © {currentYear} All rights reserved.
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Transform text into natural speech
          </div>
        </div>
      </div>
    </footer>
  );
}
