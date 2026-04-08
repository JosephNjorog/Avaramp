"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, Check, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { paymentsApi } from "@/lib/api";

const schema = z.object({
  merchantId: z.string().min(1, "Required"),
  amount:     z.string().min(1, "Required"),
  currency:   z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]),
  phone:      z.string().optional(),
  reference:  z.string().optional(),
});

type Form = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePaymentModal({ open, onClose, onCreated }: Props) {
  const [result, setResult]           = useState<any>(null);
  const [copied, setCopied]           = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { currency: "KES" },
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const onSubmit = async (data: Form) => {
    try {
      const res = await paymentsApi.create(data, crypto.randomUUID());
      setResult(res.data.data ?? res.data);
      onCreated();
      toast.success("Payment created");
    } catch (err: any) {
      toast.error(err.message || "Failed to create payment");
    }
  };

  const handleClose = () => {
    reset();
    setResult(null);
    setCopied(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={result ? "Deposit address" : "New payment"}
      description={result
        ? "Share this address with your customer. Settlement is automatic once confirmed on-chain."
        : "Generate a USDC deposit address with automatic M-Pesa settlement."}
    >
      {result ? (
        <div className="space-y-4">
          {/* Customer payment link — the main thing to share */}
          <div className="bg-indigo-dim border border-indigo-border rounded-xl p-4">
            <p className="text-xs text-muted mb-2 font-medium">Customer payment link</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-indigo-DEFAULT flex-1 break-all leading-relaxed">
                {typeof window !== "undefined" ? window.location.origin : ""}/pay/{result.id}
              </code>
              <button
                onClick={() => handleCopy(`${window.location.origin}/pay/${result.id}`, "link")}
                className="text-muted hover:text-secondary transition-colors shrink-0"
              >
                {copied === "link" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <a
              href={`/pay/${result.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-xs text-indigo-DEFAULT hover:underline"
            >
              Open customer page <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Address */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-2xs text-muted mb-2 uppercase tracking-wider font-medium">
              Deposit address (Avalanche C-Chain)
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-primary flex-1 break-all leading-relaxed">
                {result.depositAddress}
              </code>
              <button
                onClick={() => handleCopy(result.depositAddress, "address")}
                className="text-muted hover:text-secondary transition-colors shrink-0"
              >
                {copied === "address" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Send USDC",   value: result.amountUsdc },
              { label: "Fiat payout", value: `${result.fiatAmount} ${result.fiatCurrency ?? result.currency}` },
              { label: "Network",     value: "Avalanche C" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-lg p-3">
                <p className="text-2xs text-muted mb-1">{label}</p>
                <p className="text-xs font-medium text-primary">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-secondary bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2.5">
            Customer must send <strong className="text-primary mx-1">exactly {result.amountUsdc} USDC</strong> to avoid rejection. Link expires in 30 minutes.
          </div>

          <Button onClick={handleClose} variant="secondary" className="w-full">Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">Merchant ID</label>
            <input {...register("merchantId")} placeholder="mer_01234" className="input" />
            {errors.merchantId && <p className="text-xs text-red-DEFAULT">{errors.merchantId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">Amount</label>
              <input {...register("amount")} type="number" step="0.01" placeholder="5000" className="input" />
              {errors.amount && <p className="text-xs text-red-DEFAULT">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">Currency</label>
              <select {...register("currency")} className="input">
                {["KES", "NGN", "GHS", "TZS", "UGX"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              Phone <span className="text-muted font-normal">(M-Pesa recipient)</span>
            </label>
            <input {...register("phone")} placeholder="+254 7XX XXX XXX" className="input" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              Reference <span className="text-muted font-normal">(optional)</span>
            </label>
            <input {...register("reference")} placeholder="Order #123" className="input" />
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Generate deposit address
          </Button>
        </form>
      )}
    </Modal>
  );
}
