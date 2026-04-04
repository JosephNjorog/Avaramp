"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm:  z.string(),
  phone:    z.string().optional(),
}).refine((d) => d.password === d.confirm, {
  path: ["confirm"],
  message: "Passwords don't match",
});

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email, password, phone }: Form) => {
    try {
      const res = await authApi.register({ email, password, phone });
      const { user, token } = res.data.data ?? res.data;
      setAuth(user, token);
      toast.success("Account created");
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-xl bg-indigo-DEFAULT flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-primary">AvaRamp</span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-primary">Create your account</h1>
            <p className="text-sm text-secondary mt-1">Free to start. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">Email</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="input"
              />
              {errors.email && <p className="text-xs text-red-DEFAULT">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-DEFAULT">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">Confirm password</label>
              <input
                {...register("confirm")}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="input"
              />
              {errors.confirm && <p className="text-xs text-red-DEFAULT">{errors.confirm.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">
                Phone <span className="text-muted font-normal">(optional)</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+254 7XX XXX XXX"
                className="input"
              />
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="text-xs text-muted mt-4 text-center">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-secondary hover:text-primary">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-secondary hover:text-primary">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-secondary mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-DEFAULT hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
