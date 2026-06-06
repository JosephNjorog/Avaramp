"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";

export interface TutorialStep {
  icon: string;
  title: string;
  description: string;
}

interface Props {
  open: boolean;
  onDismiss: () => void;
  steps: TutorialStep[];
  title?: string;
}

export default function TutorialModal({ open, onDismiss, steps, title }: Props) {
  const [idx, setIdx] = useState(0);
  const step   = steps[idx];
  const isLast = idx === steps.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-full bg-card rounded-t-3xl border-t border-border p-6 max-w-lg mx-auto"
            style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

            <button
              onClick={onDismiss}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-secondary hover:bg-surface transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {title && (
              <p className="text-xs font-semibold text-indigo-DEFAULT uppercase tracking-widest text-center mb-4">
                {title}
              </p>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="text-center py-4"
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-secondary leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-2 mb-6 mt-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`rounded-full transition-all ${
                    i === idx
                      ? "w-6 h-2 bg-indigo-DEFAULT"
                      : "w-2 h-2 bg-border hover:bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {idx > 0 && (
                <button
                  onClick={() => setIdx((i) => i - 1)}
                  className="flex-1 py-3 rounded-2xl border border-border text-sm font-medium text-secondary hover:text-primary hover:border-muted transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => (isLast ? onDismiss() : setIdx((i) => i + 1))}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-bold transition-all active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, var(--color-indigo) 0%, #3730a3 100%)" }}
              >
                {isLast ? (
                  <>
                    <Check className="w-4 h-4" /> Got it!
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
