"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Store, Copy, Eye, EyeOff, Check } from "lucide-react";
import toast from "react-hot-toast";
import { merchantsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

const schema = z.object({
  name:       z.string().min(2, "Name required"),
  webhookUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  phone:      z.string().optional(),
});

type Form = z.infer<typeof schema>;

function SecretCell({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 font-mono">
      <span className="text-xs text-secondary flex-1 truncate">
        {show ? value : "•".repeat(Math.min(value.length, 28))}
      </span>
      <button onClick={() => setShow(!show)} className="text-muted hover:text-secondary transition-colors">
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button onClick={copy} className="text-muted hover:text-secondary transition-colors">
        {copied ? <Check className="w-3.5 h-3.5 text-green-DEFAULT" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const res = await merchantsApi.create(data);
      const merchant = res.data.data ?? res.data;
      setMerchants((prev) => [merchant, ...prev]);
      toast.success("Merchant created");
      reset();
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create merchant");
    }
  };

  return (
    <div className="p-5 md:p-7 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-primary">Merchants</h1>
          <p className="text-sm text-muted mt-0.5">Manage API keys and webhook endpoints</p>
        </div>
        <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>
          Add merchant
        </Button>
      </div>

      {/* Merchant table / empty */}
      {merchants.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Store className="w-8 h-8 text-border mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm text-secondary mb-1">No merchants yet</p>
          <p className="text-xs text-muted mb-5">Create a merchant to get your API key and webhook secret.</p>
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModalOpen(true)}>
            Create merchant
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_120px] gap-4 px-5 py-2.5 border-b border-border">
            {["Merchant", "Webhook secret", "Created"].map((h) => (
              <span key={h} className="text-2xs font-semibold text-muted uppercase tracking-wider">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-border">
            {merchants.map((m) => (
              <div key={m.id} className="grid grid-cols-[1fr_1fr_120px] gap-4 items-center px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">{m.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-2xs text-muted font-mono bg-surface px-1.5 py-0.5 rounded truncate max-w-[180px]">
                      {m.id}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(m.id); toast.success("ID copied"); }}
                      className="text-muted hover:text-secondary transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  {m.webhookUrl && (
                    <p className="text-2xs text-muted mt-1 truncate">{m.webhookUrl}</p>
                  )}
                </div>
                <div className="min-w-0">
                  {m.webhookSecret ? (
                    <SecretCell value={m.webhookSecret} />
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </div>
                <p className="text-xs text-muted">{formatDate(m.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="New merchant" description="A webhook secret is generated automatically for HMAC signing.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">Business name</label>
            <input {...register("name")} placeholder="Acme Corp" className="input" />
            {errors.name && <p className="text-xs text-red-DEFAULT">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              Webhook URL <span className="text-muted font-normal">(optional)</span>
            </label>
            <input {...register("webhookUrl")} type="url" placeholder="https://yoursite.com/webhooks" className="input" />
            {errors.webhookUrl && <p className="text-xs text-red-DEFAULT">{errors.webhookUrl.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              Phone <span className="text-muted font-normal">(optional)</span>
            </label>
            <input {...register("phone")} placeholder="+254 7XX XXX XXX" className="input" />
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create merchant
          </Button>
        </form>
      </Modal>
    </div>
  );
}
