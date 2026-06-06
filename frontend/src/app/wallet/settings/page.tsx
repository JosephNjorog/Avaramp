"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useReadContract } from "wagmi";
import { avalanche } from "wagmi/chains";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2, Wallet, Plus, Trash2, ChevronRight,
  Copy, Check, Shield, ExternalLink, LogOut,
} from "lucide-react";
import { useWalletStore, SavedWallet } from "@/store/wallets";
import { USDC, ERC20_ABI } from "@/lib/wagmi";
import { cn } from "@/lib/utils";

// ── Single wallet row ─────────────────────────────────────────────────────────

const WALLET_ICONS: Record<string, string> = {
  core:     "https://play-lh.googleusercontent.com/kO_sOPGPoGVPGJVXL8YrEW8mWKPWqXXGiw5-wMJQWyQXGJMnbBxJL7gbkyQ-mq3sEA=w96-h96-rw",
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  trust:    "https://trustwallet.com/assets/images/media/assets/TWT.png",
};

function walletIcon(name: string): string {
  const key = name.toLowerCase();
  for (const [k, url] of Object.entries(WALLET_ICONS)) {
    if (key.includes(k)) return url;
  }
  return "";
}

function WalletRow({ wallet, active, onActivate, onRemove }: {
  wallet:     SavedWallet;
  active:     boolean;
  onActivate: () => void;
  onRemove:   () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { data: raw } = useReadContract({
    address:      USDC[avalanche.id] as `0x${string}`,
    abi:          ERC20_ABI,
    functionName: "balanceOf",
    args:         [wallet.address as `0x${string}`],
    chainId:      avalanche.id,
  });

  const balance = raw !== undefined ? (Number(raw) / 1_000_000).toFixed(4) : "—";
  const icon    = walletIcon(wallet.name);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all",
        active ? "border-indigo-DEFAULT bg-indigo-dim" : "border-border bg-card"
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon ? (
          <img src={icon} alt={wallet.name} className="w-9 h-9 rounded-xl object-contain" />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-indigo-dim flex items-center justify-center">
            <Wallet className="w-5 h-5 text-indigo-DEFAULT" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary">{wallet.name}</p>
          <p className="text-xs text-muted font-mono">{wallet.address.slice(0, 10)}…{wallet.address.slice(-6)}</p>
        </div>
        {active && (
          <span className="text-[10px] font-bold text-indigo-DEFAULT bg-indigo-DEFAULT/10 border border-indigo-border px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <p className="text-[10px] text-muted uppercase tracking-widest">USDC Balance</p>
          <p className="text-sm font-bold text-primary mt-0.5">{balance} USDC</p>
        </div>
        <a
          href={`https://snowtrace.io/address/${wallet.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-indigo-DEFAULT hover:underline"
        >
          Snowtrace <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-surface border border-border text-xs text-secondary hover:text-primary transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-DEFAULT" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy address"}
        </button>

        {!active && (
          <button
            onClick={onActivate}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: "var(--color-indigo)" }}
          >
            Set active
          </button>
        )}

        <button
          onClick={onRemove}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-dim border border-red-DEFAULT/20 text-red-DEFAULT hover:bg-red-dim/80 transition-all shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Add wallet sheet ──────────────────────────────────────────────────────────

function AddSheet({ onClose }: { onClose: () => void }) {
  const { connect, connectors, isPending } = useConnect();
  const { address, connector, isConnected } = useAccount();
  const { addWallet }                       = useWalletStore();
  const [done, setDone]                     = useState(false);

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
        <h2 className="text-base font-bold text-primary mb-4">Connect a wallet</h2>
        {connectors.map((c) => {
          const icon = walletIcon(c.name);
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { wallets, activeAddress, setActive, removeWallet } = useWalletStore();
  const { disconnect }     = useDisconnect();
  const [showAdd, setShowAdd]     = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleRemove = (address: string) => {
    if (confirmRemove === address) {
      removeWallet(address);
      if (wallets.length === 1) disconnect();
      setConfirmRemove(null);
    } else {
      setConfirmRemove(address);
      setTimeout(() => setConfirmRemove(null), 3000);
    }
  };

  return (
    <>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-dim flex items-center justify-center">
            <Settings2 className="w-4.5 h-4.5 text-indigo-DEFAULT" />
          </div>
          <div>
            <h1 className="text-base font-bold text-primary">Settings</h1>
            <p className="text-xs text-muted">Manage your connected wallets</p>
          </div>
        </div>

        {/* Wallets section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-primary">
              Wallets <span className="text-muted font-normal">({wallets.length})</span>
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-DEFAULT hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add wallet
            </button>
          </div>

          {wallets.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Wallet className="w-8 h-8 text-muted mb-3" strokeWidth={1.5} />
              <p className="text-sm text-secondary mb-1">No wallets connected</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--color-indigo)" }}
              >
                Connect your first wallet
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((w) => (
                <div key={w.address}>
                  <WalletRow
                    wallet={w}
                    active={w.address === activeAddress}
                    onActivate={() => setActive(w.address)}
                    onRemove={() => handleRemove(w.address)}
                  />
                  {confirmRemove === w.address && (
                    <p className="text-xs text-red-DEFAULT text-center mt-1.5">
                      Tap again to confirm removal
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Security note */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface border border-border">
          <Shield className="w-4 h-4 text-green-DEFAULT mt-0.5 shrink-0" />
          <p className="text-xs text-secondary">
            AvaRamp never stores or has access to your private keys. Transactions are
            signed entirely in your own wallet app.
          </p>
        </div>

        {/* Disconnect all */}
        {wallets.length > 0 && (
          <button
            onClick={() => { disconnect(); wallets.forEach((w) => removeWallet(w.address)); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-red-DEFAULT border border-red-DEFAULT/20 bg-red-dim hover:bg-red-dim/80 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Disconnect all wallets
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAdd && <AddSheet onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </>
  );
}
