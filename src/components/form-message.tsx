export type Message =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {("success" in message || (message.type === "success" && "message" in message)) && (
        <div className="text-green-500 dark:text-green-400 border-l-2 border-green-500 dark:border-green-400 px-4">
          {"success" in message ? message.success : message.message}
        </div>
      )}
      {("error" in message || (message.type === "error" && "message" in message)) && (
        <div className="text-red-500 dark:text-red-400 border-l-2 border-red-500 dark:border-red-400 px-4">
          {"error" in message ? message.error : message.message}
        </div>
      )}
      {"message" in message && !("type" in message) && (
        <div className="text-foreground dark:text-gray-200 border-l-2 dark:border-gray-500 px-4">
          {message.message}
        </div>
      )}
    </div>
  );
}
