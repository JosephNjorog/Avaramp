"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, Check, ExternalLink, CheckCircle2, ChevronDown } from "lucide-react";
import QRCode from "react-qr-code";
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
  const [result, setResult]               = useState<any>(null);
  const [copied, setCopied]               = useState<string | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);

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
        amountFiat: data.amountFiat,
        currency:   data.currency,
        phone:      data.phone,
        reference:  data.reference,
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
    setShowTechDetails(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={result ? "Payment ready" : "New payment"}
      description={result
        ? "Show the QR code to your customer. Money arrives to your M-Pesa automatically — you don't need to do anything else."
        : "Enter the amount you want to receive. Your customer pays the equivalent in USDC."}
    >
      {result ? (
        <div className="space-y-3">

          {/* You're all set */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-dim border border-green-DEFAULT/20">
            <CheckCircle2 className="w-5 h-5 text-green-DEFAULT shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-DEFAULT">You're all set</p>
              <p className="text-xs text-secondary">
                M-Pesa settles automatically once the customer pays. No action needed from you.
              </p>
            </div>
          </div>

          {/* QR code — merchant shows this to customer */}
          <div className="bg-indigo-dim border border-indigo-border rounded-xl p-4 flex flex-col items-center gap-3">
            <p className="text-xs text-muted font-medium self-start">Show this to your customer</p>
            <div className="bg-white p-3 rounded-xl">
              <QRCode
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/pay/${result.id}`}
                size={180}
                level="M"
                bgColor="#ffffff"
                fgColor="#09090b"
              />
            </div>
            <p className="text-xs text-secondary text-center">
              Customer scans → opens payment page → pays with their wallet
            </p>
            <div className="w-full bg-card border border-indigo-border rounded-lg px-3 py-2 flex items-center gap-2">
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
              className="flex items-center gap-1 text-xs text-indigo-DEFAULT hover:underline"
            >
              Open customer page <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* What you receive — prominent */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">You receive</span>
              <span className="text-lg font-bold text-green-DEFAULT">
                {result.fiatAmount} {result.fiatCurrency ?? result.currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Customer sends</span>
              <span className="font-semibold text-indigo-DEFAULT">
                {parseFloat(result.amountUsdc).toFixed(4)} USDC
              </span>
            </div>
          </div>

          {/* Expiry notice */}
          <div className="flex items-center gap-2 text-xs text-secondary bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2.5">
            Link expires in 30 minutes. Customer must send
            <strong className="text-primary mx-1">exactly {parseFloat(result.amountUsdc).toFixed(4)} USDC</strong>
            to avoid rejection.
          </div>

          {/* Technical details — collapsible for advanced users */}
          <div className="border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowTechDetails((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs text-muted hover:text-secondary transition-colors"
            >
              <span>Technical details</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTechDetails ? "rotate-180" : ""}`} />
            </button>
            {showTechDetails && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <div>
                  <p className="text-2xs text-muted mb-1.5 uppercase tracking-wider font-medium">
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
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Network</span>
                  <span className="text-secondary">Avalanche C-Chain</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Token</span>
                  <span className="text-secondary">USDC (ERC-20)</span>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleClose} variant="secondary" className="w-full">Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              How much should your customer pay?
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
            <p className="text-xs text-muted">
              Enter the amount in your local currency. We'll show the customer the exact crypto amount to send.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              Your M-Pesa number <span className="text-muted font-normal">(where your money arrives)</span>
            </label>
            <input {...register("phone")} placeholder="+254 7XX XXX XXX" className="input" />
            <p className="text-xs text-muted">
              Money is sent here automatically after the customer pays.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              Reference <span className="text-muted font-normal">(optional)</span>
            </label>
            <input {...register("reference")} placeholder="Order #123" className="input" />
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Generate payment QR
          </Button>
        </form>
      )}
    </Modal>
  );
}
