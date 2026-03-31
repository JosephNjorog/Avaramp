"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?:    "sm" | "md" | "lg";
  loading?: boolean;
  icon?:    React.ReactNode;
}

const variants = {
  primary:   "bg-accent hover:bg-accent/90 text-white shadow-glow-sm hover:shadow-accent transition-all",
  secondary: "bg-accent-2/10 hover:bg-accent-2/20 text-accent-2 border border-accent-2/20 hover:border-accent-2/40",
  ghost:     "hover:bg-white/5 text-subtle hover:text-white",
  outline:   "border border-border hover:border-accent/50 bg-transparent text-white hover:bg-card",
  danger:    "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}
