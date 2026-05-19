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
  amountFiat: z.string().min(1, "Required"),
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
    defaultValues: { currency: "KES", amountFiat: "" },
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const onSubmit = async (data: Form) => {
    try {
      const res = await paymentsApi.create({
        amountFiat:   data.amountFiat,
        currency:     data.currency,
        phone:        data.phone,
        reference:    data.reference,
      }, crypto.randomUUID());
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
      title={result ? "Payment link created" : "New payment"}
      description={result
        ? "Share this link with your customer. They pay via Paystack and you receive a settlement."
        : "Create a payment link. Your customer pays via Paystack; settlement goes to your payout account."}
    >
      {result ? (
        <div className="space-y-4">
          {/* Customer payment link — primary action */}
          <div className="bg-indigo-dim border border-indigo-border rounded-xl p-4">
            <p className="text-xs text-muted mb-2 font-medium">Customer payment link</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-indigo-DEFAULT flex-1 break-all leading-relaxed">
                {typeof window !== "undefined" ? window.location.origin : ""}/pay/{result.id ?? result.paymentId}
              </code>
              <button
                onClick={() => handleCopy(`${window.location.origin}/pay/${result.id ?? result.paymentId}`, "link")}
                className="text-muted hover:text-secondary transition-colors shrink-0"
              >
                {copied === "link" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <a
              href={`/pay/${result.id ?? result.paymentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1 text-xs text-indigo-DEFAULT hover:underline"
            >
              Preview customer page <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Payment summary */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Amount</span>
              <span className="font-semibold text-primary">
                {parseFloat(result.fiatAmount ?? "0").toLocaleString()} {result.fiatCurrency ?? result.currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Collection method</span>
              <span className="text-secondary">Paystack (card / mobile money)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Settlement</span>
              <span className="text-secondary">Your configured payout account</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-secondary bg-blue-500/8 border border-blue-500/15 rounded-lg px-3 py-2.5">
            Customer clicks the link, pays on Paystack, and you receive a payout automatically. Link expires in 30 minutes.
          </div>

          <Button onClick={handleClose} variant="secondary" className="w-full">Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              Amount to collect
              <span className="ml-1 font-normal text-muted">(fiat — customer pays via Paystack)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  {...register("amountFiat")}
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="5000"
                  className="input w-full"
                />
              </div>
              <select {...register("currency")} className="input w-28 shrink-0">
                {["KES", "NGN", "GHS", "TZS", "UGX"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            {errors.amountFiat && <p className="text-xs text-red-DEFAULT">{errors.amountFiat.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              Phone <span className="text-muted font-normal">(optional — for receipt)</span>
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
            Create payment link
          </Button>
        </form>
      )}
    </Modal>
  );
}
