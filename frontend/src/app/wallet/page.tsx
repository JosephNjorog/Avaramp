"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { useReadContracts } from "wagmi";
import { avalanche } from "wagmi/chains";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ScanLine, Plus, Wallet, ChevronRight,
  TrendingUp, RefreshCw, Clock, Loader2, AlertCircle,
  CheckCircle2, UserCircle2, ArrowLeft, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useWalletStore } from "@/store/wallets";
import { usePayerAuth } from "@/store/payerAuth";
import WalletCard from "@/components/payer/WalletCard";
import TutorialModal, { TutorialStep } from "@/components/tutorial/TutorialModal";
import { USDC, ERC20_ABI } from "@/lib/wagmi";
import { payerAuthApi } from "@/lib/api";

// ── Shared wallet icon map ─────────────────────────────────────────────────────

const WALLET_ICONS: Record<string, string> = {
  core:     "https://play-lh.googleusercontent.com/kO_sOPGPoGVPGJVXL8YrEW8mWKPWqXXGiw5-wMJQWyQXGJMnbBxJL7gbkyQ-mq3sEA=w96-h96-rw",
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  trust:    "https://trustwallet.com/assets/images/media/assets/TWT.png",
};

function walletIconUrl(name: string): string {
  const key = name.toLowerCase();
  for (const [k, url] of Object.entries(WALLET_ICONS)) {
    if (key.includes(k)) return url;
  }
  return "";
}

// ── New-to-crypto guide ───────────────────────────────────────────────────────

function CryptoGuideView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      key="crypto-guide"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-sm space-y-4"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <div className="text-center mb-2">
        <div className="text-4xl mb-3">🚀</div>
        <h2 className="text-lg font-bold text-primary mb-1">New to crypto? No problem.</h2>
        <p className="text-sm text-secondary">
          Getting a wallet takes about 2 minutes and is completely free.
        </p>
      </div>

      <div className="space-y-3">
        {[
          {
            n: "1",
            icon: "📱",
            title: "Download Core Wallet",
            desc: "The official Avalanche wallet — trusted and beginner-friendly.",
            href: "https://core.app",
            cta: "Get Core →",
          },
          {
            n: "2",
            icon: "🔐",
            title: "Create your wallet",
            desc: "Open Core and follow the setup. Write down your secret phrase somewhere safe.",
          },
          {
            n: "3",
            icon: "💵",
            title: "Add USDC to your wallet",
            desc: "Buy USDC inside Core, or transfer from an exchange (Binance, Coinbase, etc.). Make sure to use the Avalanche C-Chain network.",
          },
          {
            n: "4",
            icon: "✅",
            title: "Come back and connect",
            desc: "Tap the back arrow, then select Core Wallet from the list.",
          },
        ].map(({ n, icon, title, desc, href, cta }) => (
          <div key={n} className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4">
            <div className="text-xl shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-indigo-DEFAULT uppercase tracking-widest">Step {n}</span>
              </div>
              <p className="text-sm font-semibold text-primary mb-0.5">{title}</p>
              <p className="text-xs text-muted leading-relaxed">{desc}</p>
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-DEFAULT hover:underline"
                >
                  {cta} <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted text-center pt-1">
        AvaRamp never stores your private keys. Your wallet stays yours.
      </p>
    </motion.div>
  );
}

// ── SIWE Onboarding ───────────────────────────────────────────────────────────

type OnboardStep = "connect" | "sign" | "signing" | "error";

function OnboardingScreen() {
  const { connect, connectors, isPending } = useConnect();
  const { address, connector, isConnected } = useAccount();
  const { signMessageAsync }                = useSignMessage();
  const { setAuth }                         = usePayerAuth();
  const { addWallet }                       = useWalletStore();

  const [step, setStep]           = useState<OnboardStep>("connect");
  const [errMsg, setErrMsg]       = useState("");
  const [showCryptoGuide, setShowCryptoGuide] = useState(false);

  useEffect(() => {
    if (isConnected && address && step === "connect") {
      setStep("sign");
    }
  }, [isConnected, address, step]);

  const handleSign = useCallback(async () => {
    if (!address) return;
    setStep("signing");
    setErrMsg("");

    try {
      const nonceRes = await payerAuthApi.nonce(address);
      const { message } = nonceRes.data?.data ?? nonceRes.data;

      const signature = await signMessageAsync({ message });

      const verifyRes = await payerAuthApi.verify({ address, message, signature });
      const { token, user, isNew } = verifyRes.data?.data ?? verifyRes.data;

      setAuth(user, token, isNew);
      if (connector) {
        addWallet({
          address,
          name:        connector.name,
          connectorId: connector.id,
          addedAt:     Date.now(),
        });
      }

      if (isNew) toast.success("Account created! Welcome to AvaRamp Pay.");

    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? "Something went wrong";
      if (msg.toLowerCase().includes("rejected") || msg.toLowerCase().includes("denied")) {
        setErrMsg("Signature rejected. Tap below to try again.");
      } else {
        setErrMsg(msg);
      }
      setStep("error");
    }
  }, [address, connector, signMessageAsync, setAuth, addWallet]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="flex flex-col items-center mb-10"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--color-indigo) 0%, #3730a3 100%)" }}
        >
          <Zap className="w-10 h-10 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">AvaRamp Pay</h1>
        <p className="text-sm text-secondary mt-1.5 text-center max-w-xs leading-relaxed">
          Pay with crypto, track your history, manage all your wallets in one place.
        </p>
      </motion.div>

      {/* Step indicator */}
      {!showCryptoGuide && (
        <div className="flex items-center gap-2 mb-8">
          {["connect", "sign"].map((s, i) => {
            const done    = (step === "sign" || step === "signing" || step === "error") && i === 0;
            const current = step === s || (step === "signing" && s === "sign") || (step === "error" && s === "sign");
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done    ? "bg-green-DEFAULT text-white" : ""}
                  ${current && !done ? "bg-indigo-DEFAULT text-white ring-4 ring-indigo-DEFAULT/20" : ""}
                  ${!done && !current ? "bg-surface border border-border text-muted" : ""}
                `}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[10px] text-muted font-medium">
                  {i === 0 ? "Connect wallet" : "Create account"}
                </span>
                {i === 0 && <div className="w-8 h-px bg-border mx-1" />}
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* Crypto guide */}
        {showCryptoGuide && (
          <CryptoGuideView onBack={() => setShowCryptoGuide(false)} />
        )}

        {/* Step 1: Choose wallet */}
        {!showCryptoGuide && step === "connect" && (
          <motion.div
            key="connect"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-sm space-y-3"
          >
            <p className="text-xs text-muted font-medium uppercase tracking-widest text-center mb-4">
              Step 1 — Connect your wallet
            </p>
            {connectors.map((c) => {
              const icon = walletIconUrl(c.name);
              return (
                <button
                  key={c.id}
                  onClick={() => connect({ connector: c })}
                  disabled={isPending}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-card border border-border hover:border-indigo-DEFAULT/50 active:scale-[0.98] transition-all group"
                >
                  {icon ? (
                    <img src={icon} alt={c.name} className="w-9 h-9 rounded-xl object-contain" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-indigo-dim flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-indigo-DEFAULT" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-primary">{c.name}</p>
                    <p className="text-xs text-muted">
                      {c.type === "injected" ? "Browser extension" : "Mobile & QR connect"}
                    </p>
                  </div>
                  {isPending
                    ? <Loader2 className="w-4 h-4 text-muted animate-spin" />
                    : <ChevronRight className="w-4 h-4 text-muted group-hover:text-secondary" />}
                </button>
              );
            })}

            <button
              onClick={() => setShowCryptoGuide(true)}
              className="w-full text-center text-xs text-indigo-DEFAULT hover:underline py-2 mt-1"
            >
              I&apos;m new to crypto — where do I start?
            </button>
          </motion.div>
        )}

        {/* Step 2: Sign to create account */}
        {!showCryptoGuide && (step === "sign" || step === "signing" || step === "error") && (
          <motion.div
            key="sign"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-sm space-y-4"
          >
            <p className="text-xs text-muted font-medium uppercase tracking-widest text-center">
              Step 2 — Create your account
            </p>

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-dim border border-green-DEFAULT/20">
              <CheckCircle2 className="w-5 h-5 text-green-DEFAULT shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-green-DEFAULT">Wallet connected</p>
                <p className="text-xs font-mono text-muted truncate">
                  {address?.slice(0, 10)}…{address?.slice(-6)}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <UserCircle2 className="w-4 h-4 text-indigo-DEFAULT" />
                <p className="text-sm font-semibold text-primary">Sign in to AvaRamp Pay</p>
              </div>
              {[
                "Free — no transaction, no gas fee",
                "Your wallet address becomes your login",
                "Payment history synced across devices",
                "Add phone or email later for notifications",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-indigo-DEFAULT mt-2 shrink-0" />
                  <p className="text-xs text-secondary">{item}</p>
                </div>
              ))}
            </div>

            {step === "error" && errMsg && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-red-dim border border-red-DEFAULT/20">
                <AlertCircle className="w-4 h-4 text-red-DEFAULT shrink-0 mt-0.5" />
                <p className="text-xs text-red-DEFAULT">{errMsg}</p>
              </div>
            )}

            <button
              onClick={handleSign}
              disabled={step === "signing"}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, var(--color-indigo) 0%, #3730a3 100%)" }}
            >
              {step === "signing" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing — check your wallet…</>
              ) : step === "error" ? (
                <><Zap className="w-4 h-4" /> Try again</>
              ) : (
                <><Zap className="w-4 h-4" /> Sign in — it&apos;s free</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted text-center mt-8 max-w-xs">
        AvaRamp never stores your private keys. Signing happens entirely in your wallet.
      </p>
    </div>
  );
}

// ── Add-wallet sheet ──────────────────────────────────────────────────────────

function AddWalletSheet({ onClose }: { onClose: () => void }) {
  const { connect, connectors, isPending } = useConnect();
  const { address, connector, isConnected } = useAccount();
  const { addWallet }   = useWalletStore();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isConnected && address && connector && !done) {
      setDone(true);
      addWallet({ address, name: connector.name, connectorId: connector.id, addedAt: Date.now() });
      setTimeout(onClose, 500);
    }
  }, [isConnected, address, connector, addWallet, onClose, done]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-card rounded-t-3xl border-t border-border p-6 space-y-3"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
        <h2 className="text-base font-bold text-primary mb-4">Add another wallet</h2>
        {connectors.map((c) => {
          const icon = walletIconUrl(c.name);
          return (
            <button
              key={c.id}
              onClick={() => connect({ connector: c })}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-surface border border-border hover:border-indigo-DEFAULT/50 transition-all active:scale-[0.98]"
            >
              {icon ? (
                <img src={icon} alt={c.name} className="w-8 h-8 rounded-xl object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-indigo-dim flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-indigo-DEFAULT" />
                </div>
              )}
              <span className="text-sm font-semibold text-primary">{c.name}</span>
              <ChevronRight className="w-4 h-4 text-muted ml-auto" />
            </button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// ── Payer tutorial steps ──────────────────────────────────────────────────────

const PAYER_TUTORIAL: TutorialStep[] = [
  {
    icon: "👋",
    title: "Welcome to AvaRamp Pay",
    description: "You can pay merchants with crypto and they receive M-Pesa automatically. No back-and-forth needed.",
  },
  {
    icon: "📷",
    title: "Scan to pay",
    description: "When a merchant shows you a QR code, tap the Scan button at the bottom and point your camera at it.",
  },
  {
    icon: "💸",
    title: "Send USDC, they receive fiat",
    description: "You send USDC from your wallet. The merchant gets KES (or their local currency) in their M-Pesa — instantly.",
  },
  {
    icon: "🔒",
    title: "Your keys, your wallet",
    description: "AvaRamp never stores your private keys. Your wallet is always in your control.",
  },
];

// ── Home screen ───────────────────────────────────────────────────────────────

const FIAT = [
  { code: "KES", rate: 129.4,  label: "Kenya"    },
  { code: "NGN", rate: 1580.0, label: "Nigeria"  },
  { code: "GHS", rate: 15.2,   label: "Ghana"    },
  { code: "TZS", rate: 2720.0, label: "Tanzania" },
  { code: "UGX", rate: 3840.0, label: "Uganda"   },
];

function HomeScreen() {
  const { wallets, activeAddress, setActive } = useWalletStore();
  const { user, isNew }                       = usePayerAuth();
  const [showAddSheet, setShowAddSheet]       = useState(false);
  const [showTutorial, setShowTutorial]       = useState(false);
  const [fiatIdx, setFiatIdx]                 = useState(0);
  const fiat = FIAT[fiatIdx];

  // Show tutorial on first login
  useEffect(() => {
    if (isNew) setShowTutorial(true);
  }, [isNew]);

  const { data: balances, refetch } = useReadContracts({
    contracts: wallets.map((w) => ({
      address:      USDC[avalanche.id] as `0x${string}`,
      abi:          ERC20_ABI,
      functionName: "balanceOf" as const,
      args:         [w.address as `0x${string}`],
      chainId:      avalanche.id,
    })),
  });

  const totalUsdc = (balances ?? []).reduce((sum, b) => {
    if (b.status === "success" && b.result !== undefined) {
      return sum + Number(b.result) / 1_000_000;
    }
    return sum;
  }, 0);

  const totalFiat = (totalUsdc * fiat.rate).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-indigo)" }}
            >
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base text-primary tracking-tight">AvaRamp Pay</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:text-secondary hover:bg-surface transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-indigo-dim border border-indigo-border">
              <UserCircle2 className="w-3.5 h-3.5 text-indigo-DEFAULT" />
              <span className="text-[10px] font-semibold text-indigo-DEFAULT">
                {user?.walletAddress?.slice(0, 6)}…{user?.walletAddress?.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Total balance card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--color-indigo) 0%, #312e81 100%)" }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

          <p className="text-xs text-indigo-200 font-medium mb-1 relative z-10">Total Balance</p>
          <p className="text-4xl font-bold tracking-tight relative z-10">
            {totalUsdc.toFixed(2)}
            <span className="text-lg font-medium text-indigo-200 ml-2">USDC</span>
          </p>

          <div className="flex items-center justify-between mt-3 relative z-10">
            <p className="text-sm text-indigo-100">≈ {fiat.code} {totalFiat}</p>
            <button
              onClick={() => setFiatIdx((i) => (i + 1) % FIAT.length)}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors rounded-full px-3 py-1"
            >
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">{fiat.code}</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/15 flex items-center gap-2 relative z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <p className="text-xs text-indigo-200">
              Avalanche C-Chain · {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>

        {/* FX rate strip */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-2xl">
          <div className="w-1.5 h-1.5 rounded-full bg-green-DEFAULT animate-pulse" />
          <p className="text-xs text-secondary">
            1 USDC ≈ <span className="text-primary font-semibold">{fiat.code} {fiat.rate.toLocaleString()}</span>
          </p>
          <span className="ml-auto text-[10px] text-muted">indicative rate</span>
        </div>

        {/* Wallet carousel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-primary">Wallets</p>
            <Link href="/wallet/settings" className="text-xs text-indigo-DEFAULT hover:underline">Manage</Link>
          </div>

          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          >
            {wallets.map((w) => (
              <div key={w.address} style={{ scrollSnapAlign: "start" }}>
                <WalletCard
                  address={w.address}
                  name={w.name}
                  active={w.address === activeAddress}
                  onClick={() => setActive(w.address)}
                />
              </div>
            ))}
            <div style={{ scrollSnapAlign: "start" }}>
              <button
                onClick={() => setShowAddSheet(true)}
                className="flex-shrink-0 w-44 min-h-[120px] rounded-2xl border-2 border-dashed border-border hover:border-indigo-DEFAULT/50 flex flex-col items-center justify-center gap-2 text-muted hover:text-indigo-DEFAULT transition-all active:scale-95"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-medium">Add wallet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/wallet/scan"
            className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl bg-indigo-dim border border-indigo-border hover:border-indigo-DEFAULT/60 active:scale-[0.98] transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-indigo)" }}>
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Scan to pay</p>
              <p className="text-xs text-muted">Point at merchant QR</p>
            </div>
          </Link>

          <Link
            href="/wallet/history"
            className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl bg-card border border-border hover:border-muted active:scale-[0.98] transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">History</p>
              <p className="text-xs text-muted">Past transactions</p>
            </div>
          </Link>
        </div>

      </div>

      <AnimatePresence>
        {showAddSheet && <AddWalletSheet onClose={() => setShowAddSheet(false)} />}
      </AnimatePresence>

      <TutorialModal
        open={showTutorial}
        onDismiss={() => setShowTutorial(false)}
        steps={PAYER_TUTORIAL}
        title="Quick tour"
      />
    </>
  );
}

// ── Root page ─────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const { token } = usePayerAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-indigo)" }}
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!token ? (
        <motion.div key="onboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <OnboardingScreen />
        </motion.div>
      ) : (
        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <HomeScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
