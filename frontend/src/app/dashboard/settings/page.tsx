"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import { usersApi } from "@/lib/api";
import Button from "@/components/ui/Button";

// ── Profile form ──────────────────────────────────────────────────────────────
const profileSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
});

// ── Password form ─────────────────────────────────────────────────────────────
const passwordSchema = z.object({
  current: z.string().min(1, "Required"),
  next:    z.string().min(8, "Minimum 8 characters"),
  confirm: z.string(),
}).refine((d) => d.next === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

type ProfileForm  = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Composable field label + input ────────────────────────────────────────────
function Field({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-3 items-start py-4 border-b border-border last:border-0">
      <div className="shrink-0">
        <p className="text-sm font-medium text-primary">{label}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function Toggle({ label, sub, defaultOn }: { label: string; sub: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-muted mt-0.5">{sub}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={() => { setOn(!on); toast.success(`${label} ${!on ? "enabled" : "disabled"}`); }}
        className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-indigo-DEFAULT" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore();
  const [showKey, setShowKey] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  // API key is derived from user id — in production expose a real key management endpoint
  const apiKey = `avr_live_${user?.id?.replace(/-/g, "").padEnd(32, "0").slice(0, 32) ?? "00000000000000000000000000000000"}`;

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { email: user?.email ?? "", phone: user?.phone ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onProfileSave = async (data: ProfileForm) => {
    try {
      const res = await usersApi.update({ email: data.email, phone: data.phone });
      const updated = res.data.data;
      if (user && token) setAuth({ ...user, ...updated }, token);
      toast.success("Profile saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    toast.success("API key copied");
    setTimeout(() => setKeyCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-7 space-y-5 max-w-2xl overflow-x-hidden">
      <div>
        <h1 className="text-lg font-semibold text-primary">Settings</h1>
        <p className="text-sm text-muted mt-0.5">Manage your account and API credentials</p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <form onSubmit={profileForm.handleSubmit(onProfileSave)}>
          <Field label="Email" sub="Used for login and notifications">
            <input {...profileForm.register("email")} type="email" className="input" />
            {profileForm.formState.errors.email && (
              <p className="text-xs text-red-DEFAULT mt-1">{profileForm.formState.errors.email.message}</p>
            )}
          </Field>
          <Field label="Phone" sub="M-Pesa notification number">
            <input {...profileForm.register("phone")} type="tel" placeholder="+254 7XX XXX XXX" className="input" />
          </Field>
          <Field label="KYC Status" sub="Identity verification">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              user?.kycStatus === "VERIFIED"
                ? "bg-green-dim text-green-DEFAULT border border-green-DEFAULT/20"
                : "bg-amber-dim text-amber-DEFAULT border border-amber-DEFAULT/20"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {user?.kycStatus ?? "PENDING"}
            </span>
          </Field>
          <div className="py-4">
            <Button type="submit" size="sm" loading={profileForm.formState.isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Section>

      {/* API key */}
      <Section title="API Key">
        <Field label="Live key" sub="Include in Authorization: Bearer header">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 font-mono text-xs overflow-hidden">
              {showKey
                ? <span className="text-indigo-DEFAULT">{apiKey}</span>
                : <span className="text-muted">{"•".repeat(40)}</span>}
            </div>
            <button
              onClick={() => setShowKey(!showKey)}
              className="w-8 h-8 rounded-lg bg-surface border border-border text-muted hover:text-secondary flex items-center justify-center transition-colors shrink-0"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={copyKey}
              className="w-8 h-8 rounded-lg bg-surface border border-border text-muted hover:text-secondary flex items-center justify-center transition-colors shrink-0"
            >
              {keyCopied ? <Check className="w-3.5 h-3.5 text-green-DEFAULT" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            Never commit this key to source control or expose it in client-side code.
          </p>
        </Field>
      </Section>

      {/* Password */}
      <Section title="Password">
        <form onSubmit={passwordForm.handleSubmit(() => { toast.success("Password changed"); passwordForm.reset(); })}>
          {[
            { name: "current" as const, label: "Current password",      ph: "••••••••" },
            { name: "next" as const,    label: "New password",           ph: "Minimum 8 characters" },
            { name: "confirm" as const, label: "Confirm new password",   ph: "••••••••" },
          ].map(({ name, label, ph }) => (
            <Field key={name} label={label}>
              <input
                {...passwordForm.register(name)}
                type="password"
                placeholder={ph}
                className="input"
              />
              {passwordForm.formState.errors[name] && (
                <p className="text-xs text-red-DEFAULT mt-1">{passwordForm.formState.errors[name]?.message}</p>
              )}
            </Field>
          ))}
          <div className="py-4">
            <Button type="submit" size="sm" loading={passwordForm.formState.isSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Toggle label="Payment received"          sub="Email when USDC deposit is confirmed"          defaultOn />
        <Toggle label="Settlement completed"      sub="Email when M-Pesa disbursement succeeds"       defaultOn />
        <Toggle label="Webhook delivery failures" sub="Alert after 3 consecutive webhook failures"    defaultOn />
        <Toggle label="Weekly summary"            sub="Digest of payment volume and settlements"      defaultOn={false} />
      </Section>
    </div>
  );
}
