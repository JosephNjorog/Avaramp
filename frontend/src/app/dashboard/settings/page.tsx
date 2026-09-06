"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, Plus, Trash2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import { usersApi, merchantsApi, apiKeysApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";

// ── Payout form ───────────────────────────────────────────────────────────────
const payoutSchema = z.object({
  payoutType:       z.enum(["phone", "till", "paybill"]),
  payoutAccount:    z.string().min(1, "Required"),
  payoutAccountRef: z.string().optional(),
  payoutCurrency:   z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]),
  mobileNetwork:    z.string().optional(),
});
type PayoutForm = z.infer<typeof payoutSchema>;

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

const NOTIF_KEY = "avaramp_notif_prefs";

function loadNotifPrefs(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "{}");
  } catch { return {}; }
}

function Toggle({ label, sub, defaultOn, storageKey }: { label: string; sub: string; defaultOn: boolean; storageKey: string }) {
  const [on, setOn] = useState(() => {
    if (typeof window === "undefined") return defaultOn;
    const saved = loadNotifPrefs();
    return storageKey in saved ? saved[storageKey] : defaultOn;
  });

  const toggle = () => {
    const next = !on;
    setOn(next);
    const prefs = loadNotifPrefs();
    prefs[storageKey] = next;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
    toast.success(`${label} ${next ? "enabled" : "disabled"}`);
  };

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-muted mt-0.5">{sub}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={toggle}
        className={`relative w-9 h-5 rounded-full transition-colors ${on ? "bg-indigo-DEFAULT" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore();

  const payoutForm = useForm<PayoutForm>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      payoutType:     "till",
      payoutAccount:  "",
      payoutCurrency: "KES",
      mobileNetwork:  "",
    },
  });
  const payoutType = payoutForm.watch("payoutType");

  useEffect(() => {
    merchantsApi.me().then((res) => {
      const m = res.data.data;
      if (!m) return;
      payoutForm.reset({
        payoutType:       (m.payoutType     as PayoutForm["payoutType"])     ?? "till",
        payoutAccount:    m.payoutAccount   ?? "",
        payoutAccountRef: m.payoutAccountRef ?? "",
        payoutCurrency:   (m.payoutCurrency  as PayoutForm["payoutCurrency"]) ?? "KES",
        mobileNetwork:    m.mobileNetwork ?? "",
      });
    }).catch(() => {});
  }, []);

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

      {/* API keys */}
      <ApiKeysSection />

      {/* Password */}
      <Section title="Password">
        <form onSubmit={passwordForm.handleSubmit(async (data) => {
          try {
            await usersApi.changePassword(data.current, data.next);
            toast.success("Password changed");
            passwordForm.reset();
          } catch (err: any) {
            toast.error(err.message || "Failed to change password");
          }
        })}>
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

      {/* Payout Settings */}
      <Section title="Payout Settings">
        <form onSubmit={payoutForm.handleSubmit(async (data) => {
          try {
            await merchantsApi.updatePayout(data);
            toast.success("Payout settings saved");
          } catch (err: any) {
            toast.error(err.message || "Failed to save payout settings");
          }
        })}>
          <Field label="Payout destination" sub="How you want to receive settlements">
            <div className="flex gap-2 flex-wrap">
              {(["till", "paybill", "phone"] as const).map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={type}
                    {...payoutForm.register("payoutType")}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm text-primary capitalize">
                    {type === "till" ? "Till Number (Buy Goods)" : type === "paybill" ? "Paybill Number" : "Phone Number (M-Pesa/MoMo)"}
                  </span>
                </label>
              ))}
            </div>
          </Field>
          <Field
            label={payoutType === "till" ? "Till Number" : payoutType === "paybill" ? "Paybill Number" : "Phone Number"}
            sub={payoutType === "till" ? "Your Lipa na M-Pesa till" : payoutType === "paybill" ? "Your paybill short code" : "e.g. +254712345678"}
          >
            <input
              {...payoutForm.register("payoutAccount")}
              type="text"
              placeholder={payoutType === "phone" ? "+254 7XX XXX XXX" : payoutType === "till" ? "123456" : "400200"}
              className="input"
            />
            {payoutForm.formState.errors.payoutAccount && (
              <p className="text-xs text-red-DEFAULT mt-1">{payoutForm.formState.errors.payoutAccount.message}</p>
            )}
          </Field>
          {payoutType === "paybill" && (
            <Field label="Account Reference" sub="Account name or number shown to payer (e.g. company name)">
              <input
                {...payoutForm.register("payoutAccountRef")}
                type="text"
                placeholder="e.g. Your Company Name"
                className="input"
              />
            </Field>
          )}
          {payoutType === "phone" && (
            <Field label="Mobile Network" sub="Carrier for this phone number, e.g. Safaricom, MTN, Airtel">
              <input
                {...payoutForm.register("mobileNetwork")}
                type="text"
                placeholder="Safaricom"
                className="input"
              />
            </Field>
          )}
          <Field label="Settlement Currency" sub="Currency you receive payouts in">
            <select {...payoutForm.register("payoutCurrency")} className="input">
              <option value="KES">KES — Kenyan Shilling</option>
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="GHS">GHS — Ghanaian Cedi</option>
              <option value="TZS">TZS — Tanzanian Shilling</option>
              <option value="UGX">UGX — Ugandan Shilling</option>
            </select>
          </Field>
          <div className="py-4">
            <Button type="submit" size="sm" loading={payoutForm.formState.isSubmitting}>
              Save payout settings
            </Button>
          </div>
        </form>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Toggle label="Payment received"          sub="Email when USDC deposit is confirmed"                storageKey="payment_received"    defaultOn />
        <Toggle label="Settlement completed"      sub="Email when mobile money disbursement succeeds"       storageKey="settlement_complete" defaultOn />
        <Toggle label="Webhook delivery failures" sub="Alert after 3 consecutive webhook failures"          storageKey="webhook_failures"    defaultOn />
        <Toggle label="Weekly summary"            sub="Digest of payment volume and settlements"            storageKey="weekly_summary"      defaultOn={false} />
      </Section>
    </div>
  );
}

// ── API Keys ──────────────────────────────────────────────────────────────────
type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

function ApiKeysSection() {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => apiKeysApi.list().then((res) => res.data.data as ApiKey[]),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => apiKeysApi.create(name).then((res) => res.data.data),
    onSuccess: (created) => {
      setRevealedKey(created.key);
      setNewKeyName("");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to create API key"),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiKeysApi.revoke(id),
    onSuccess: () => {
      toast.success("API key revoked");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to revoke API key"),
  });

  const copyRevealedKey = () => {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    toast.success("API key copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const activeKeys = (data ?? []).filter((k) => !k.revokedAt);

  return (
    <Section title="API Keys">
      {revealedKey && (
        <div className="my-4 rounded-lg border border-amber-DEFAULT/30 bg-amber-dim p-4">
          <p className="text-xs font-medium text-amber-DEFAULT mb-2">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 font-mono text-xs text-indigo-DEFAULT overflow-x-auto whitespace-nowrap">
              {revealedKey}
            </code>
            <button
              onClick={copyRevealedKey}
              className="w-8 h-8 rounded-lg bg-surface border border-border text-muted hover:text-secondary flex items-center justify-center transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-DEFAULT" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            onClick={() => setRevealedKey(null)}
            className="text-xs text-muted hover:text-secondary mt-2"
          >
            Done
          </button>
        </div>
      )}

      <Field label="Generate new key" sub="Use in an x-api-key header for server-to-server integrations">
        <div className="flex gap-2">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            type="text"
            placeholder="e.g. Production backend"
            className="input flex-1"
          />
          <Button
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => newKeyName.trim() && createMutation.mutate(newKeyName.trim())}
            loading={createMutation.isPending}
          >
            Generate
          </Button>
        </div>
      </Field>

      <div className="py-4">
        {isLoading ? (
          <p className="text-xs text-muted">Loading keys…</p>
        ) : activeKeys.length === 0 ? (
          <p className="text-xs text-muted">No API keys yet — generate one above to integrate programmatically.</p>
        ) : (
          <div className="space-y-2">
            {activeKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between gap-3 bg-surface border border-border rounded-lg px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <KeyRound className="w-3.5 h-3.5 text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-primary truncate">{key.name}</p>
                    <p className="text-2xs text-muted font-mono">
                      {key.prefix}… · created {formatDate(key.createdAt)}
                      {key.lastUsedAt ? ` · last used ${formatDate(key.lastUsedAt)}` : " · never used"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => revokeMutation.mutate(key.id)}
                  disabled={revokeMutation.isPending}
                  className="w-8 h-8 rounded-lg bg-surface border border-border text-muted hover:text-red-DEFAULT flex items-center justify-center transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
