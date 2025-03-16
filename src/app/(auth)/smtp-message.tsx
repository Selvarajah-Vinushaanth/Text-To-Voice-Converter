import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="bg-muted/50 dark:bg-gray-700/50 px-5 py-3 border dark:border-gray-600 mt-[2rem] rounded-md flex gap-4">
      <InfoIcon size={16} className="mt-0.5 dark:text-gray-300" />
      <div className="flex flex-col gap-1">
        <small className="text-sm text-secondary-foreground dark:text-gray-300">
          <strong> Note:</strong> Emails are rate limited. Enable Custom SMTP to
          increase the rate limit.
        </small>
        <div>
          <Link
            href="https://supabase.com/docs/guides/auth/auth-smtp"
            target="_blank"
            className="text-primary/50 hover:text-primary flex items-center text-sm gap-1 dark:text-blue-400/50 dark:hover:text-blue-400"
          >
            Learn more <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
