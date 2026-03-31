"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { paymentsApi, merchantsApi } from "@/lib/api";

const schema = z.object({
  merchantId: z.string().min(1, "Merchant ID required"),
  amount:     z.string().min(1, "Amount required"),
  currency:   z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]),
  reference:  z.string().optional(),
  phone:      z.string().optional(),
});

type Form = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (payment: any) => void;
}

export default function CreatePaymentModal({ open, onClose, onCreated }: Props) {
  const [result, setResult] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "KES" },
  });

  const onSubmit = async (data: Form) => {
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await paymentsApi.create(data, idempotencyKey);
      const payment = res.data.data;
      setResult(payment);
      onCreated(payment);
      toast.success("Payment created — share the deposit address");
    } catch (err: any) {
      toast.error(err.message || "Failed to create payment");
    }
  };

  const handleClose = () => {
    reset();
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">New Payment</h2>
              <button onClick={handleClose} className="text-muted hover:text-subtle transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="bg-surface rounded-xl p-4 text-center">
                  <div className="text-muted text-xs mb-1">Deposit Address (Avalanche C-Chain)</div>
                  <div className="text-accent text-xs font-mono break-all">{result.depositAddress}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-surface rounded-xl p-3">
                    <div className="text-muted text-xs">Amount (USDC)</div>
                    <div className="text-white font-semibold">{result.amountUsdc}</div>
                  </div>
                  <div className="bg-surface rounded-xl p-3">
                    <div className="text-muted text-xs">Fiat Amount</div>
                    <div className="text-white font-semibold">{result.fiatAmount} {result.currency}</div>
                  </div>
                </div>
                <p className="text-muted text-xs text-center">
                  Send exactly {result.amountUsdc} USDC to the address above on Avalanche C-Chain.
                  Settlement is automatic once confirmed.
                </p>
                <Button onClick={handleClose} className="w-full" variant="outline">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Merchant ID</label>
                  <input
                    {...register("merchantId")}
                    placeholder="merchant_xxxx"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                  {errors.merchantId && <p className="text-red-400 text-xs mt-1">{errors.merchantId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Amount</label>
                    <input
                      {...register("amount")}
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                    />
                    {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Currency</label>
                    <select
                      {...register("currency")}
                      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/50 transition-all"
                    >
                      {["KES", "NGN", "GHS", "TZS", "UGX"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone <span className="text-muted">(for M-Pesa)</span>
                  </label>
                  <input
                    {...register("phone")}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Reference <span className="text-muted">(optional)</span>
                  </label>
                  <input
                    {...register("reference")}
                    placeholder="Order #123"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white text-sm placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  />
                </div>

                <Button type="submit" className="w-full mt-1" loading={isSubmitting}>
                  Generate Payment →
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
