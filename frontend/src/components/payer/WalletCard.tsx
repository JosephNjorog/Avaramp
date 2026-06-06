"use client";

import { useReadContract } from "wagmi";
import { avalanche } from "wagmi/chains";
import { USDC, ERC20_ABI } from "@/lib/wagmi";
import { cn } from "@/lib/utils";

// Map connector/wallet name → icon URL
const WALLET_ICON: Record<string, string> = {
  core:       "https://play-lh.googleusercontent.com/kO_sOPGPoGVPGJVXL8YrEW8mWKPWqXXGiw5-wMJQWyQXGJMnbBxJL7gbkyQ-mq3sEA=w96-h96-rw",
  metamask:   "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  trust:      "https://trustwallet.com/assets/images/media/assets/TWT.png",
  coinbase:   "https://avatars.githubusercontent.com/u/1885080?s=96&v=4",
};

function walletIcon(name: string): string {
  const key = name.toLowerCase();
  for (const [k, url] of Object.entries(WALLET_ICON)) {
    if (key.includes(k)) return url;
  }
  return "";
}

interface WalletCardProps {
  address: string;
  name:    string;
  active:  boolean;
  onClick: () => void;
}

export default function WalletCard({ address, name, active, onClick }: WalletCardProps) {
  const { data: raw } = useReadContract({
    address:      USDC[avalanche.id] as `0x${string}`,
    abi:          ERC20_ABI,
    functionName: "balanceOf",
    args:         [address as `0x${string}`],
    chainId:      avalanche.id,
  });

  const balance = raw !== undefined
    ? (Number(raw) / 1_000_000).toFixed(2)
    : "—";

  const icon = walletIcon(name);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-44 rounded-2xl p-4 text-left transition-all border select-none",
        active
          ? "border-indigo-DEFAULT shadow-lg"
          : "bg-card border-border hover:border-indigo-DEFAULT/40 active:scale-95"
      )}
      style={active ? {
        background: "linear-gradient(135deg, var(--color-indigo) 0%, #3730a3 100%)",
      } : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        {icon ? (
          <img src={icon} alt={name} className="w-8 h-8 rounded-xl object-contain bg-white p-0.5" />
        ) : (
          <div className="w-8 h-8 rounded-xl bg-indigo-dim flex items-center justify-center text-base">
            💎
          </div>
        )}
        {active && (
          <span className="text-[10px] font-semibold text-indigo-100 bg-white/20 px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      <p className={cn("text-[11px] font-medium mb-0.5 truncate", active ? "text-indigo-100" : "text-muted")}>
        {name}
      </p>
      <p className={cn("text-lg font-bold leading-tight", active ? "text-white" : "text-primary")}>
        {balance}
        <span className={cn("text-xs font-medium ml-1", active ? "text-indigo-200" : "text-muted")}>USDC</span>
      </p>
      <p className={cn("text-[10px] font-mono mt-2 truncate", active ? "text-indigo-200" : "text-muted")}>
        {address.slice(0, 6)}…{address.slice(-4)}
      </p>
    </button>
  );
}
