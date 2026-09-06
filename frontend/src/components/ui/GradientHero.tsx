import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientHeroProps {
  children: ReactNode;
  className?: string;
  /** Homepage hero uses the full dramatic version; page intros use a lighter touch. */
  strong?: boolean;
}

/**
 * Full-bleed radial-gradient backdrop used at the top of every page for a
 * consistent visual entrance. Uses the site's existing --color-bg/--color-indigo
 * tokens (globals.css) so it adapts automatically across light/dark theme —
 * no hardcoded colors.
 */
export function GradientHero({ children, className, strong = false }: GradientHeroProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn("absolute inset-0 -z-10", strong ? "opacity-40" : "opacity-[0.14]")}
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, var(--color-bg) 40%, var(--color-indigo) 100%)",
        }}
      />
      {children}
    </div>
  );
}

export default GradientHero;
