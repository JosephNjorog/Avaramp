"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Store, Copy, Eye, EyeOff, X, Globe, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { merchantsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";

const schema = z.object({
  name:       z.string().min(2, "Name required"),
  webhookUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  phone:      z.string().optional(),
});

type Form = z.infer<typeof schema>;

function SecretField({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  const display = show ? value : "•".repeat(Math.min(value.length, 32));

  return (
    <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-1.5">
      <span className="text-muted text-xs font-mono flex-1 truncate">{display}</span>
      <button onClick={() => setShow(!show)} className="text-muted hover:text-white transition-colors">
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied!"); }}
        className="text-muted hover:text-white transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function MerchantsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Note: the API returns a single merchant per user in current implementation
  // We store the created merchant in local state for display
  const [merchants, setMerchants] = useState<any[]>([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const res = await merchantsApi.create(data);
      const merchant = res.data.data;
      setMerchants((prev) => [merchant, ...prev]);
      toast.success("Merchant created successfully");
      reset();
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create merchant");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Merchants</h1>
          <p className="text-subtle text-sm mt-1">Manage merchant accounts and webhook configurations</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Add merchant
        </Button>
      </div>

      {/* Merchant cards */}
      {merchants.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-12 text-center"
        >
          <Store className="w-12 h-12 text-border mx-auto mb-4" />
          <div className="text-white font-medium mb-1">No merchants yet</div>
          <div className="text-muted text-sm mb-5">Create a merchant to start accepting payments</div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            Create first merchant
          </Button>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {merchants.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold">{m.name}</div>
                  <div className="text-muted text-xs font-mono truncate">{m.id}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Merchant ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-mono">{m.id?.slice(0, 16)}…</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(m.id); toast.success("Copied!"); }}
                      className="text-muted hover:text-accent transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {m.webhookSecret && (
                  <div>
                    <span className="text-muted block mb-1">Webhook Secret</span>
                    <SecretField value={m.webhookSecret} />
                  </div>
                )}

                {m.webhookUrl && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span className="text-white truncate">{m.webhookUrl}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-muted">Created</span>
                  <span className="text-white">{formatDate(m.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold">New Merchant</h2>
                <button onClick={() => setModalOpen(false)} className="text-muted hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Business name</label>
                  <input
                    {...register("name")}
                    placeholder="Acme Corp"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Webhook URL <span className="text-muted">(optional)</span>
                  </label>
                  <input
                    {...register("webhookUrl")}
                    type="url"
                    placeholder="https://yoursite.com/webhooks/avaramp"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all"
                  />
                  {errors.webhookUrl && <p className="text-red-400 text-xs mt-1">{errors.webhookUrl.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone <span className="text-muted">(optional)</span>
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 transition-all"
                  />
                </div>

                <Button type="submit" className="w-full mt-1" loading={isSubmitting}>
                  Create merchant →
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
