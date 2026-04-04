"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <div className={cn(
          "flex items-center bg-surface border rounded-lg overflow-hidden transition-all duration-150",
          "focus-within:border-indigo-border focus-within:ring-2 focus-within:ring-indigo-dim",
          error ? "border-red-DEFAULT/50" : "border-border",
        )}>
          {prefix && <div className="pl-3.5 text-muted shrink-0">{prefix}</div>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 bg-transparent px-3.5 py-2.5 text-sm text-primary placeholder:text-muted",
              "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
              prefix && "pl-2",
              suffix && "pr-2",
              className
            )}
            {...props}
          />
          {suffix && <div className="pr-3.5 text-muted shrink-0">{suffix}</div>}
        </div>
        {error && <p className="text-xs text-red-DEFAULT">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
