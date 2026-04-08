import { createConfig, http } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// Get a free project ID at https://cloud.reown.com
// Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "avaramp_dev";

export const wagmiConfig = createConfig({
  chains: [avalanche, avalancheFuji],
  connectors: [
    injected(),                                // MetaMask, Core, Rabby etc. (browser extension)
    walletConnect({ projectId }),              // WalletConnect QR / mobile deep links
  ],
  transports: {
    [avalanche.id]:     http("https://api.avax.network/ext/bc/C/rpc"),
    [avalancheFuji.id]: http("https://api.avax-test.network/ext/bc/C/rpc"),
  },
  ssr: true,
});

// USDC contract addresses
export const USDC = {
  [avalanche.id]:     "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  [avalancheFuji.id]: "0x5425890298aed601595a70AB815c96711a31Bc65",
} as const;

// Minimal ERC-20 ABI for transfer + allowance
export const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs:  [{ name: "to",     type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "",       type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs:  [{ name: "account", type: "address" }],
    outputs: [{ name: "",        type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;
