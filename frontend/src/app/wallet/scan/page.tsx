"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flashlight, Link2, ArrowRight, AlertCircle, Zap } from "lucide-react";

type ScanState = "starting" | "scanning" | "error" | "success" | "no-camera";

// Extract payment ID from any AvaRamp pay URL or raw UUID
function extractPaymentId(text: string): string | null {
  // Full URL: https://avaramp.io/pay/uuid or /pay/uuid
  const urlMatch = text.match(/\/pay\/([0-9a-f-]{36})/i);
  if (urlMatch) return urlMatch[1];
  // Raw UUID
  const uuidMatch = text.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  if (uuidMatch) return text;
  return null;
}

// Corner bracket SVG for scan frame
function ScanFrame() {
  return (
    <div className="relative w-64 h-64">
      {/* Corner brackets */}
      {[
        "top-0 left-0",
        "top-0 right-0 rotate-90",
        "bottom-0 right-0 rotate-180",
        "bottom-0 left-0 -rotate-90",
      ].map((pos, i) => (
        <svg
          key={i}
          className={`absolute ${pos} w-10 h-10`}
          viewBox="0 0 40 40"
          fill="none"
        >
          <path d="M2 20 L2 2 L20 2" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ))}

      {/* Scanning line */}
      <motion.div
        className="absolute left-3 right-3 h-0.5 bg-indigo-DEFAULT/80 rounded-full shadow-sm"
        style={{ boxShadow: "0 0 8px var(--color-indigo)" }}
        animate={{ top: ["12px", "calc(100% - 12px)", "12px"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function ScanPage() {
  const router                     = useRouter();
  const videoRef                   = useRef<HTMLVideoElement>(null);
  const streamRef                  = useRef<MediaStream | null>(null);
  const scannerRef                 = useRef<any>(null);
  const [state, setState]          = useState<ScanState>("starting");
  const [errorMsg, setErrorMsg]    = useState<string>("");
  const [pasteUrl, setPasteUrl]    = useState("");
  const [showPaste, setShowPaste]  = useState(false);

  const handleFound = useCallback((paymentId: string) => {
    // Stop camera before navigating
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (scannerRef.current) {
      scannerRef.current.stop?.().catch(() => {});
    }
    setState("success");
    setTimeout(() => router.push(`/pay/${paymentId}`), 400);
  }, [router]);

  // Start html5-qrcode scanner
  useEffect(() => {
    let stopped = false;

    const start = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (stopped) return;

        const scanner = new Html5Qrcode("qr-reader-container");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 12, qrbox: { width: 240, height: 240 }, disableFlip: false },
          (decodedText: string) => {
            const id = extractPaymentId(decodedText);
            if (id) handleFound(id);
          },
          () => { /* per-frame error — ignore */ }
        );

        if (!stopped) setState("scanning");
      } catch (err: any) {
        if (stopped) return;
        const msg = err?.message ?? String(err);
        if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied")) {
          setState("no-camera");
        } else {
          setErrorMsg(msg);
          setState("error");
        }
        setShowPaste(true);
      }
    };

    start();

    return () => {
      stopped = true;
      if (scannerRef.current) {
        scannerRef.current.stop?.().catch(() => {});
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [handleFound]);

  const handlePasteSubmit = () => {
    const id = extractPaymentId(pasteUrl.trim());
    if (id) {
      router.push(`/pay/${id}`);
    } else {
      setErrorMsg("Could not find a valid payment link. Make sure you copied the full URL.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-safe"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-indigo)" }}
          >
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-semibold text-sm">Scan to pay</span>
        </div>
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-95 transition-all"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Camera view — html5-qrcode injects video here */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">

        {/* The scanner mounts the video into this div */}
        <div
          id="qr-reader-container"
          className="absolute inset-0"
          style={{
            // Override html5-qrcode's default styles
            // The video it injects should fill the container
          }}
        />

        {/* Dim overlay with transparent center */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          background: "radial-gradient(ellipse 280px 280px at center, transparent 45%, rgba(0,0,0,0.65) 55%)"
        }} />

        {/* Scan frame overlay */}
        <div className="relative z-10">
          {state === "scanning" && <ScanFrame />}

          {state === "starting" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <p className="text-white/70 text-sm">Starting camera…</p>
            </div>
          )}

          {state === "success" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          )}

          {(state === "error" || state === "no-camera") && (
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-white font-semibold">
                {state === "no-camera" ? "Camera access denied" : "Scanner unavailable"}
              </p>
              <p className="text-white/60 text-sm">
                {state === "no-camera"
                  ? "Allow camera access in your browser settings, or paste the payment link below."
                  : "Use the paste option below to enter the payment link manually."}
              </p>
            </div>
          )}
        </div>

        {/* Instruction */}
        {state === "scanning" && (
          <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-2">
            <p className="text-white/80 text-sm text-center px-4">
              Point the camera at the merchant&apos;s payment QR code
            </p>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div
        className="relative z-20 bg-card/95 backdrop-blur-md border-t border-border px-4 py-4 space-y-3"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Toggle paste input */}
        <button
          onClick={() => setShowPaste((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface border border-border hover:border-indigo-DEFAULT/40 transition-all text-sm text-secondary"
        >
          <Link2 className="w-4 h-4" />
          Or paste a payment link
        </button>

        <AnimatePresence>
          {showPaste && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  value={pasteUrl}
                  onChange={(e) => setPasteUrl(e.target.value)}
                  placeholder="https://avaramp.io/pay/..."
                  className="input flex-1 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handlePasteSubmit()}
                  autoFocus
                />
                <button
                  onClick={handlePasteSubmit}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ background: "var(--color-indigo)" }}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-red-DEFAULT mt-2">{errorMsg}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
