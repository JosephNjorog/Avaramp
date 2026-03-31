"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  phone:    z.string().optional(),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  path: ["confirm"],
  message: "Passwords do not match",
});

type Form = z.infer<typeof schema>;

const perks = [
  "Free to start — no setup fees",
  "Sub-2-minute M-Pesa settlements",
  "Open source & self-hostable",
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password, phone }: Form) => {
    try {
      const res = await authApi.register({ email, password, phone });
      setAuth(res.data.data.user, res.data.data.token);
      toast.success("Account created! Welcome to AvaRamp.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow opacity-40" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-accent">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-white font-bold text-xl">
              Ava<span className="text-gradient-purple">Ramp</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-subtle text-sm">Start accepting crypto payments in minutes</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-card mb-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone <span className="text-muted">(optional)</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+254 7XX XXX XXX"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-subtle transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm password</label>
              <input
                {...register("confirm")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
              />
              {errors.confirm && <p className="text-red-400 text-xs mt-1.5">{errors.confirm.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
              Create account →
            </Button>
          </form>

          <p className="text-center mt-5 text-subtle text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:text-accent-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Perks */}
        <div className="space-y-2">
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-2.5 text-subtle text-sm">
              <CheckCircle2 className="w-4 h-4 text-accent-2 shrink-0" />
              {p}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
