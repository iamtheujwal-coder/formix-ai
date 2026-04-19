import { Loader2 } from "lucide-react";

export function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-zinc-500 animate-in fade-in duration-500">
      <Loader2 className="h-10 w-10 animate-spin text-black dark:text-white" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
