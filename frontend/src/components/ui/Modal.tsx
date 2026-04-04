"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const sizes = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

export default function Modal({ open, onClose, title, description, size = "md", children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "relative w-full bg-card border border-border rounded-2xl shadow-menu",
              sizes[size]
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between p-5 pb-4 border-b border-border">
                <div>
                  {title && <h2 className="text-sm font-semibold text-primary">{title}</h2>}
                  {description && <p className="text-xs text-secondary mt-0.5">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-secondary transition-colors -mt-0.5 -mr-0.5 p-1 rounded-lg hover:bg-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
