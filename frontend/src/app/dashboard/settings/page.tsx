"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, KeyRound, Phone, Bell, Shield, Copy, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import Button from "@/components/ui/Button";

const profileSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  current:  z.string().min(8),
  next:     z.string().min(8, "Minimum 8 characters"),
  confirm:  z.string(),
}).refine((d) => d.next === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

type ProfileForm   = z.infer<typeof profileSchema>;
type PasswordForm  = z.infer<typeof passwordSchema>;

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border">
        <Icon className="w-4 h-4 text-accent" />
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [apiKey] = useState(`avr_live_${Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, "0")).join("")}`);
  const [showApiKey, setShowApiKey] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { email: user?.email ?? "", phone: user?.phone ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSave = async (data: ProfileForm) => {
    // TODO: wire to PATCH /users/me
    toast.success("Profile updated");
  };

  const onPasswordChange = async (data: PasswordForm) => {
    // TODO: wire to POST /users/me/password
    toast.success("Password changed");
    passwordForm.reset();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-subtle text-sm mt-1">Manage your account and API access</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <form onSubmit={profileForm.handleSubmit(onProfileSave)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Email</label>
            <input
              {...profileForm.register("email")}
              type="email"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Phone <span className="text-muted">(for M-Pesa notifications)</span>
            </label>
            <input
              {...profileForm.register("phone")}
              placeholder="+254 7XX XXX XXX"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" size="sm" loading={profileForm.formState.isSubmitting}>
              Save changes
            </Button>
            <div className={`text-xs px-2.5 py-1 rounded-full ${
              user?.kycStatus === "VERIFIED"
                ? "bg-emerald-400/10 text-emerald-400"
                : "bg-amber-400/10 text-amber-400"
            }`}>
              KYC: {user?.kycStatus ?? "PENDING"}
            </div>
          </div>
        </form>
      </Section>

      {/* API Keys */}
      <Section title="API Keys" icon={KeyRound}>
        <div className="space-y-4">
          <p className="text-subtle text-sm">
            Use your API key to authenticate requests to the AvaRamp API.
            Keep it secret — treat it like a password.
          </p>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Live API Key</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm font-mono">
                {showApiKey ? (
                  <span className="text-accent">{apiKey}</span>
                ) : (
                  <span className="text-muted">{"•".repeat(40)}</span>
                )}
              </div>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="w-10 h-10 rounded-xl bg-surface border border-border text-muted hover:text-white flex items-center justify-center transition-colors"
              >
                {showApiKey ? "🙈" : "👁"}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(apiKey); toast.success("API key copied"); }}
                className="w-10 h-10 rounded-xl bg-surface border border-border text-muted hover:text-white flex items-center justify-center transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-amber-400/80 text-xs bg-amber-400/5 border border-amber-400/15 rounded-xl px-4 py-3">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            Never expose your API key in client-side code or public repositories.
          </div>
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" icon={Shield}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
          {[
            { name: "current" as const, label: "Current password", placeholder: "••••••••" },
            { name: "next" as const,    label: "New password",      placeholder: "Min. 8 characters" },
            { name: "confirm" as const, label: "Confirm new password", placeholder: "••••••••" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-white mb-2">{label}</label>
              <input
                {...passwordForm.register(name)}
                type="password"
                placeholder={placeholder}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all"
              />
              {passwordForm.formState.errors[name] && (
                <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors[name]?.message}</p>
              )}
            </div>
          ))}
          <Button type="submit" size="sm" loading={passwordForm.formState.isSubmitting}>
            Update password
          </Button>
        </form>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-3">
          {[
            { label: "Payment received",         desc: "Email when a new USDC deposit is confirmed",       defaultOn: true },
            { label: "Settlement completed",      desc: "Email when M-Pesa disbursement succeeds",          defaultOn: true },
            { label: "Webhook delivery failures", desc: "Alert on consecutive webhook failures",            defaultOn: true },
            { label: "Weekly summary",            desc: "Weekly digest of payment volume and settlements",  defaultOn: false },
          ].map(({ label, desc, defaultOn }) => (
            <ToggleRow key={label} label={label} desc={desc} defaultOn={defaultOn} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-white text-sm font-medium">{label}</div>
        <div className="text-muted text-xs mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => { setOn(!on); toast.success(`${label} ${!on ? "enabled" : "disabled"}`); }}
        className={`relative w-10 h-5.5 rounded-full transition-colors ${on ? "bg-accent" : "bg-surface border border-border"}`}
        style={{ height: 22, minWidth: 40 }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${on ? "translate-x-[18px]" : ""}`}
        />
      </button>
    </div>
  );
}
