import { cn } from "@/lib/utils";

const METHOD_STYLES: Record<string, string> = {
  GET:    "bg-blue-500/15 text-blue-400 border-blue-500/20",
  POST:   "bg-green-500/15 text-green-400 border-green-500/20",
  PATCH:  "bg-amber-500/15 text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function EndpointBadge({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex items-center gap-3 font-mono bg-surface border border-border rounded-lg px-4 py-3 my-4">
      <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", METHOD_STYLES[method] ?? METHOD_STYLES.GET)}>
        {method}
      </span>
      <span className="text-primary text-sm">{path}</span>
    </div>
  );
}
