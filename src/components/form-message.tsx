export type Message = {
  type: "success" | "error";
  message: string;
};

export function FormMessage({ message }: { message: Message }) {
  const isSuccess = message.type === "success";
  
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      <div className={`${
        isSuccess 
          ? "text-green-500 dark:text-green-400 border-l-2 border-green-500 dark:border-green-400" 
          : "text-red-500 dark:text-red-400 border-l-2 border-red-500 dark:border-red-400"
      } px-4`}>
        {message.message}
      </div>
    </div>
  );
}
