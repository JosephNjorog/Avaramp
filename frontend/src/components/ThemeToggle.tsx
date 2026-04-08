"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore, initTheme } from "@/store/theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useThemeStore();

  // Sync DOM on first render
  useEffect(() => {
    initTheme(theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
        "text-secondary hover:text-primary hover:bg-surface border border-transparent hover:border-border",
        className
      )}
    >
      <Sun
        className={cn(
          "w-4 h-4 absolute transition-all duration-300",
          theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
        )}
      />
      <Moon
        className={cn(
          "w-4 h-4 absolute transition-all duration-300",
          theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        )}
      />
    </button>
  );
}
