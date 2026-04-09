"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Zap, CheckCircle2, ExternalLink, Check } from "lucide-react";
import toast from "react-hot-toast";
import { authApi, merchantsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";

// ── Two-step schema ───────────────────────────────────────────────────────────

const step1Schema = z.object({
  businessName:  z.string().min(2, "Enter your business name"),
  email:         z.string().email("Enter a valid email"),
  phone:         z.string().min(8, "Enter your phone number"),
  password:      z.string().min(8, "Minimum 8 characters"),
  confirm:       z.string(),
  acceptTerms:   z.literal(true, { errorMap: () => ({ message: "You must accept the Terms of Service" }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "You must accept the Privacy Policy" }) }),
  acceptCookies: z.literal(true, { errorMap: () => ({ message: "You must accept the Cookie Policy" }) }),
}).refine((d) => d.password === d.confirm, {
  path: ["confirm"], message: "Passwords don't match",
});

type Step1Form = z.infer<typeof step1Schema>;

// ── Checkbox that actually works ─────────────────────────────────────────────

function LegalCheckbox({
  field, checked, error, label,
}: {
  field:   React.InputHTMLAttributes<HTMLInputElement>;
  checked: boolean;
  error?:  string;
  label:   React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        {/* Real input overlaid so clicks register; styled div shows state */}
        <div className="relative mt-0.5 shrink-0 w-4 h-4">
          <input
            {...field}
            type="checkbox"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Use inline style for the dynamic colour — Tailwind purge-safe */}
          <div
            className="w-4 h-4 rounded border-2 transition-all flex items-center justify-center pointer-events-none"
            style={{
              backgroundColor: checked ? "var(--color-indigo)"        : "transparent",
              borderColor:     checked ? "var(--color-indigo)"        : "var(--color-muted)",
            }}
          >
            {checked && (
              <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,6 5,9 10,3" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-secondary leading-relaxed">{label}</span>
      </label>
      {error && <p className="text-xs text-red-400 mt-1 ml-7">{error}</p>}
    </div>
  );
}

// ── What merchants get ────────────────────────────────────────────────────────

const PERKS = [
  "Accept crypto from customers worldwide",
  "Settle directly to M-Pesa, MTN, Airtel",
  "No wallet or crypto knowledge needed",
  "Payments land in under 5 minutes",
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router      = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [step, setStep]         = useState<1 | 2>(1);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      acceptTerms:   undefined as unknown as true,
      acceptPrivacy: undefined as unknown as true,
      acceptCookies: undefined as unknown as true,
    },
  });

  const watchTerms   = watch("acceptTerms");
  const watchPrivacy = watch("acceptPrivacy");
  const watchCookies = watch("acceptCookies");

  // ── Step 1: create account ─────────────────────────────────────────────────
  const onStep1 = async (data: Step1Form) => {
    try {
      const res             = await authApi.register({ email: data.email, password: data.password, phone: data.phone });
      const { user, token } = res.data.data ?? res.data;
      setAuth(user, token);

      // Auto-create merchant profile with business name
      try {
        await merchantsApi.create({ name: data.businessName, phone: data.phone });
      } catch {
        // Non-fatal — merchant can be created from dashboard
      }

      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  // ── Step 2: done ───────────────────────────────────────────────────────────
  const goToDashboard = () => router.replace("/dashboard");

  return (
    <div className="min-h-screen flex bg-bg">

      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-indigo-DEFAULT flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-primary">AvaRamp</span>
          </Link>

          {step === 1 ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary">Start accepting payments</h1>
                <p className="text-sm text-secondary mt-1.5">
                  Free account. No contracts. No crypto knowledge needed.
                </p>
              </div>

              <form onSubmit={handleSubmit(onStep1)} className="space-y-4">

                {/* Business name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-primary">Business name</label>
                  <input
                    {...register("businessName")}
                    placeholder="Acme Electronics"
                    className="input"
                    autoFocus
                  />
                  {errors.businessName && <p className="text-xs text-red-400">{errors.businessName.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-primary">Work email</label>
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="you@business.com"
                    className="input"
                  />
                  {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-primary">
                    Phone number
                    <span className="text-muted font-normal ml-1 text-xs">(for settlement alerts)</span>
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    className="input"
                  />
                  {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
                </div>

                {/* Password */}
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
                  {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>

                {/* Confirm */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-primary">Confirm password</label>
                  <input
                    {...register("confirm")}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="input"
                  />
                  {errors.confirm && <p className="text-xs text-red-400">{errors.confirm.message}</p>}
                </div>

                {/* ── Legal acceptance ──────────────────────────────────────── */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider pt-1">
                    Legal Agreements (Required)
                  </p>

                  {/* Terms of Service */}
                  <LegalCheckbox
                    field={register("acceptTerms")}
                    checked={!!watchTerms}
                    error={errors.acceptTerms?.message}
                    label={<>
                      I have read, understood, and agree to the{" "}
                      <Link href="/terms" target="_blank" className="text-indigo-DEFAULT hover:underline inline-flex items-center gap-0.5">
                        Terms of Service <ExternalLink className="w-3 h-3" />
                      </Link>
                      {" "}including the Limitation of Liability, Prohibited Activities, and KYC/AML requirements.
                    </>}
                  />

                  {/* Privacy Policy */}
                  <LegalCheckbox
                    field={register("acceptPrivacy")}
                    checked={!!watchPrivacy}
                    error={errors.acceptPrivacy?.message}
                    label={<>
                      I have read and accept the{" "}
                      <Link href="/privacy" target="_blank" className="text-indigo-DEFAULT hover:underline inline-flex items-center gap-0.5">
                        Privacy Policy <ExternalLink className="w-3 h-3" />
                      </Link>
                      , including collection and use of my personal data and the Blockchain Transparency Notice.
                    </>}
                  />

                  {/* Cookie Policy */}
                  <LegalCheckbox
                    field={register("acceptCookies")}
                    checked={!!watchCookies}
                    error={errors.acceptCookies?.message}
                    label={<>
                      I consent to AvaRamp's use of cookies and local storage as described in the{" "}
                      <Link href="/cookies" target="_blank" className="text-indigo-DEFAULT hover:underline inline-flex items-center gap-0.5">
                        Cookie Policy <ExternalLink className="w-3 h-3" />
                      </Link>
                      .
                    </>}
                  />
                </div>
                {/* ── End legal acceptance ──────────────────────────────────── */}

                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Create my account
                </Button>
              </form>

              <p className="text-center text-sm text-secondary mt-5">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-indigo-DEFAULT hover:underline font-medium">Sign in</Link>
              </p>
            </>
          ) : (
            /* ── Step 2: success ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">You're all set</h1>
              <p className="text-sm text-secondary mb-8">
                Your merchant account is ready. Go to your dashboard to create your first payment link.
              </p>

              <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-3 mb-8">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">What's next</p>
                {[
                  { step: "1", text: "Create a payment from the dashboard" },
                  { step: "2", text: "Share the link with your customer" },
                  { step: "3", text: "Customer pays USDC — you get KES" },
                ].map(({ step: s, text }) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-dim border border-indigo-border text-indigo-DEFAULT text-xs font-bold flex items-center justify-center shrink-0">
                      {s}
                    </div>
                    <p className="text-sm text-secondary">{text}</p>
                  </div>
                ))}
              </div>

              <Button onClick={goToDashboard} className="w-full" size="lg">
                Go to dashboard →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right panel — hidden on mobile */}
      <div className="hidden lg:flex w-[420px] bg-card border-l border-border flex-col justify-center px-12">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
            What you get
          </p>
          <ul className="space-y-4">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-DEFAULT shrink-0 mt-0.5" />
                <span className="text-sm text-secondary leading-snug">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-border rounded-2xl p-5 bg-surface">
          <p className="text-xs text-muted mb-3">How a customer pays</p>
          <div className="space-y-2">
            {[
              { who: "You",       action: "Send them the payment link" },
              { who: "Customer",  action: "Opens link, scans QR or taps Connect Wallet" },
              { who: "AvaRamp",   action: "Detects USDC, converts, pays M-Pesa" },
              { who: "Done",      action: "Money lands in under 5 minutes" },
            ].map(({ who, action }) => (
              <div key={who} className="flex items-start gap-2.5">
                <span className="text-[10px] font-bold text-indigo-DEFAULT bg-indigo-dim border border-indigo-border px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 min-w-[52px] text-center">
                  {who}
                </span>
                <p className="text-xs text-secondary">{action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-indigo-dim border border-indigo-border rounded-xl">
          <p className="text-xs font-semibold text-primary mb-1">Protected by law</p>
          <p className="text-xs text-secondary">
            AvaRamp operates under the Kenya Data Protection Act, 2019 and POCAMLA compliance framework. Your data is encrypted and handled with care.
          </p>
        </div>

        <p className="text-xs text-muted text-center mt-6">
          1.5% per successful settlement · No monthly fee
        </p>
      </div>
    </div>
  );
}
