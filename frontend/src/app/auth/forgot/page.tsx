"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import api from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    setServerError("");
    try {
      await api.post("/auth/forgot-password", { email: values.email });
    } catch {
      // Always show success to prevent email enumeration
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #1a1a2e, #7c6ff7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(124,111,247,0.4)",
            }}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
              <polygon points="13.5,2 8.5,13 12,13 10,22 15.5,11 12,11" fill="white" />
            </svg>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-menu">
          {sent ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-indigo-DEFAULT" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-primary mb-1">Check your inbox</h1>
                <p className="text-sm text-secondary">
                  If <span className="font-medium text-primary">{getValues("email")}</span> is
                  registered, we sent a password reset link. It expires in 30 minutes.
                </p>
              </div>
              <p className="text-xs text-muted">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-indigo-DEFAULT hover:underline"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-5">
                <h1 className="text-lg font-semibold text-primary mb-1">Reset your password</h1>
                <p className="text-sm text-secondary">
                  Enter the email associated with your AvaRamp account and we&apos;ll send a reset
                  link.
                </p>
              </div>

              {serverError && (
                <p className="text-sm text-red-400 mb-4 bg-red-500/8 border border-red-500/20 rounded-lg px-3 py-2">
                  {serverError}
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
