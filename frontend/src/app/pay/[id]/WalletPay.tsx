"use client";

import { useState, useEffect } from "react";
import {
  useAccount, useConnect, useDisconnect,
  useSendTransaction, useWriteContract, useWaitForTransactionReceipt,
  useSwitchChain,
} from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import { avalanche } from "wagmi/chains";
import {
  Wallet, Loader2, CheckCircle2, XCircle,
  ExternalLink, ChevronRight, AlertCircle, LogOut,
} from "lucide-react";
import { wagmiConfig, USDC, ERC20_ABI } from "@/lib/wagmi";
import { cn } from "@/lib/utils";

// ── Wallet logo map ───────────────────────────────────────────────────────────

const WALLET_ICONS: Record<string, string> = {
  "io.metamask":         "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  "com.coinbase.wallet": "https://avatars.githubusercontent.com/u/1885080?s=200&v=4",
};

// ── Deep links for mobile wallets ─────────────────────────────────────────────
// EIP-681 URI: ethereum:{USDC_CONTRACT}@{CHAIN_ID}/transfer?address={TO}&uint256={AMOUNT}

function buildEIP681(depositAddress: string, amountUsdc: string, chainId = 43114) {
  const usdcAddress = chainId === 43113 ? USDC[43113] : USDC[43114];
  const raw = BigInt(Math.round(parseFloat(amountUsdc) * 1_000_000)).toString();
  return `ethereum:${usdcAddress}@${chainId}/transfer?address=${depositAddress}&uint256=${raw}`;
}

const MOBILE_WALLETS = [
  {
    name: "Core Wallet",
    icon: "https://play-lh.googleusercontent.com/kO_sOPGPoGVPGJVXL8YrEW8mWKPWqXXGiw5-wMJQWyQXGJMnbBxJL7gbkyQ-mq3sEA=w240-h480-rw",
    deepLink: (uri: string) => `core://transfer?${new URLSearchParams({ uri })}`,
    storeAndroid: "https://play.google.com/store/apps/details?id=com.avaxwallet",
    storeIos: "https://apps.apple.com/us/app/core-crypto-wallet-nft/id6443685999",
  },
  {
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    deepLink: (uri: string) => `https://metamask.app.link/send/${uri.replace("ethereum:", "")}`,
    storeAndroid: "https://play.google.com/store/apps/details?id=io.metamask",
    storeIos: "https://apps.apple.com/us/app/metamask/id1438144202",
  },
  {
    name: "Trust Wallet",
    icon: "https://trustwallet.com/assets/images/media/assets/TWT.png",
    deepLink: (uri: string) => `trust://send?coin=60&asset=c60_t${USDC[43114]}&address=${uri.split("address=")[1]?.split("&")[0]}&amount=${uri.split("uint256=")[1]}`,
    storeAndroid: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp",
    storeIos: "https://apps.apple.com/us/app/trust-crypto-bitcoin-wallet/id1288339409",
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface WalletPayProps {
  depositAddress: string;
  amountUsdc: string;
  fiatAmount: string;
  fiatCurrency: string;
  onSuccess?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WalletPay({
  depositAddress, amountUsdc, fiatAmount, fiatCurrency, onSuccess,
}: WalletPayProps) {
  const [mode, setMode] = useState<"idle" | "choose" | "mobile" | "connecting" | "paying" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  const [txHash, setTxHash]       = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect }                      = useDisconnect();
  const { switchChain }                     = useSwitchChain();
  const { writeContractAsync }              = useWriteContract();

  const { isLoading: isMining, isSuccess: isMined } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  // When connected and wrong chain, auto-switch
  useEffect(() => {
    if (isConnected && chainId !== avalanche.id) {
      switchChain({ chainId: avalanche.id });
    }
  }, [isConnected, chainId, switchChain]);

  // When tx mined → done
  useEffect(() => {
    if (isMined) {
      setMode("done");
      onSuccess?.();
    }
  }, [isMined, onSuccess]);

  // ── Pay via connected browser wallet ────────────────────────────────────────

  const handlePay = async () => {
    setErrorMsg(null);
    setMode("paying");
    try {
      const amount = parseUnits(amountUsdc, 6); // USDC = 6 decimals
      const hash = await writeContractAsync({
        address: USDC[avalanche.id],
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [depositAddress as `0x${string}`, amount],
        chainId: avalanche.id,
      });
      setTxHash(hash);
    } catch (err: any) {
      setErrorMsg(err?.shortMessage ?? err?.message ?? "Transaction rejected");
      setMode("error");
    }
  };

  // ── Mobile deep link ─────────────────────────────────────────────────────────

  const eip681 = buildEIP681(depositAddress, amountUsdc, avalanche.id);

  // ── Idle button ──────────────────────────────────────────────────────────────

  if (mode === "idle") {
    return (
      <button
        onClick={() => setMode("choose")}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-indigo-DEFAULT hover:bg-indigo-DEFAULT/90 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-DEFAULT/20"
      >
        <Wallet className="w-4 h-4" />
        Connect wallet & pay
      </button>
    );
  }

  // ── Choose method ────────────────────────────────────────────────────────────

  if (mode === "choose") {
    const browserConnectors = connectors.filter((c) => c.type === "injected" || c.id === "injected");
    const hasExtension = browserConnectors.length > 0;

    return (
      <div className="rounded-2xl border border-indigo-border bg-indigo-dim overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-border">
          <p className="text-sm font-semibold text-primary">Choose how to pay</p>
          <button onClick={() => setMode("idle")} className="text-xs text-muted hover:text-secondary">Cancel</button>
        </div>

        <div className="p-3 space-y-2">
          {/* Browser extension wallet */}
          {hasExtension && !isConnected && (
            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest px-1 mb-1.5">Browser wallet</p>
              {browserConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    setMode("connecting");
                    connect({ connector }, {
                      onSuccess: () => setMode("paying"),
                      onError: (e) => { setErrorMsg(e.message); setMode("error"); },
                    });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card hover:bg-surface border border-border transition-all text-sm text-primary font-medium"
                >
                  {WALLET_ICONS[connector.id]
                    ? <img src={WALLET_ICONS[connector.id]} className="w-6 h-6 rounded" alt={connector.name} />
                    : <Wallet className="w-5 h-5 text-indigo-DEFAULT" />}
                  {connector.name}
                  <ChevronRight className="w-4 h-4 text-muted ml-auto" />
                </button>
              ))}
            </div>
          )}

          {/* Already connected */}
          {isConnected && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400 font-medium">Wallet connected</p>
                <p className="text-xs text-muted font-mono mt-0.5">
                  {address?.slice(0, 6)}…{address?.slice(-4)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePay}
                  className="px-3 py-1.5 rounded-lg bg-indigo-DEFAULT text-white text-xs font-semibold hover:bg-indigo-DEFAULT/90 transition-colors"
                >
                  Pay now
                </button>
                <button onClick={() => disconnect()} className="text-muted hover:text-secondary transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile wallets */}
          <div>
            <p className="text-[10px] text-muted uppercase tracking-widest px-1 mb-1.5 mt-1">
              Mobile app
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_WALLETS.map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.deepLink(eip681)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card hover:bg-surface border border-border transition-all"
                >
                  <img
                    src={wallet.icon}
                    className="w-8 h-8 rounded-xl object-contain"
                    alt={wallet.name}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-[11px] text-secondary">{wallet.name}</span>
                </a>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-center text-muted pt-1 pb-1">
            Any Avalanche C-Chain wallet works · USDC · chainId 43114
          </p>
        </div>
      </div>
    );
  }

  // ── Connecting ────────────────────────────────────────────────────────────────

  if (mode === "connecting") {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-6 text-center">
        <Loader2 className="w-8 h-8 text-indigo-DEFAULT animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-primary">Connecting wallet</p>
        <p className="text-xs text-secondary mt-1">Check your wallet app or extension</p>
      </div>
    );
  }

  // ── Paying (waiting for user approval in wallet) ──────────────────────────────

  if (mode === "paying") {
    return (
      <div className="rounded-2xl border border-indigo-border bg-indigo-dim px-5 py-6 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-DEFAULT animate-spin mx-auto" />
        <div>
          <p className="text-sm font-semibold text-primary">
            {isMining ? "Transaction submitted" : "Confirm in your wallet"}
          </p>
          <p className="text-xs text-secondary mt-1">
            {isMining
              ? "Waiting for Avalanche confirmation (~2 seconds)"
              : `Sending ${amountUsdc} USDC to deposit address`}
          </p>
        </div>
        {txHash && (
          <a
            href={`https://snowtrace.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-indigo-DEFAULT hover:underline"
          >
            View on Snowtrace <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  // ── Done ─────────────────────────────────────────────────────────────────────

  if (mode === "done") {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/8 px-5 py-5 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-green-400">USDC sent successfully</p>
        <p className="text-xs text-secondary mt-1">
          AvaRamp is processing your {fiatCurrency} payout — page will update automatically
        </p>
        {txHash && (
          <a
            href={`https://snowtrace.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-DEFAULT hover:underline"
          >
            Tx: {txHash.slice(0, 10)}… <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-5 py-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-400">Transaction failed</p>
          <p className="text-xs text-secondary mt-1">{errorMsg}</p>
        </div>
      </div>
      <button
        onClick={() => { setMode("choose"); setErrorMsg(null); }}
        className="mt-3 w-full py-2 rounded-xl bg-card border border-border text-sm text-secondary hover:text-primary transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
