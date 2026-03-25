import { createAvalancheConfig } from "@avalabs/avalanche-sdk";

export const AVALANCHE_CONFIG = {
  // C-Chain (mainnet) — where USDC lives
  cChain: {
    rpcUrl:    process.env.AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
    chainId:   43114,
    wsUrl:     process.env.AVALANCHE_WS_URL  || "wss://api.avax.network/ext/bc/C/ws",
  },
  // Fuji testnet
  fuji: {
    rpcUrl:    "https://api.avax-test.network/ext/bc/C/rpc",
    chainId:   43113,
    wsUrl:     "wss://api.avax-test.network/ext/bc/C/ws",
  },
  contracts: {
    paymentGateway: process.env.PAYMENT_GATEWAY_ADDRESS!,
    usdc:           "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6C", // USDC on C-Chain
  },
  dataApi: {
    key:     process.env.GLACIER_API_KEY!,
    baseUrl: "https://glacier-api.avax.network",
  },
};
