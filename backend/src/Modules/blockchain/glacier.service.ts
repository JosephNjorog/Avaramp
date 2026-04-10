import axios from "axios";
import { ethers } from "ethers";
import { logger } from "../../shared/Utils/Logger";

// Public Avalanche C-Chain RPC — no API key required
const AVAX_PUBLIC_RPC = "https://api.avax.network/ext/bc/C/rpc";

// Minimal ERC-20 ABI for Transfer event
const ERC20_TRANSFER_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export class GlacierService {
  private baseUrl = "https://glacier-api.avax.network";
  private apiKey  = process.env.GLACIER_API_KEY;

  /**
   * Get ERC-20 transfers to a deposit address.
   * Uses Glacier API if GLACIER_API_KEY is set, otherwise falls back
   * to querying the public Avalanche RPC via ethers.js.
   */
  async getERC20Transfers(address: string, contractAddress: string): Promise<any[]> {
    if (this.apiKey) {
      return this.getTransfersViaGlacier(address, contractAddress);
    }
    return this.getTransfersViaRpc(address, contractAddress);
  }

  private async getTransfersViaGlacier(address: string, contractAddress: string): Promise<any[]> {
    const res = await axios.get(
      `${this.baseUrl}/v1/chains/43114/addresses/${address}/transactions:listErc20`,
      {
        headers: { "x-glacier-api-key": this.apiKey },
        params:  { contractAddress, pageSize: 10 },
      }
    );
    return res.data.transactions ?? [];
  }

  private async getTransfersViaRpc(address: string, contractAddress: string): Promise<any[]> {
    try {
      const provider = new ethers.JsonRpcProvider(AVAX_PUBLIC_RPC);
      const contract = new ethers.Contract(contractAddress, ERC20_TRANSFER_ABI, provider);

      // Query last 2000 blocks (~16 min on Avalanche, blocks every ~2s)
      const latestBlock = await provider.getBlockNumber();
      const fromBlock   = Math.max(0, latestBlock - 2000);

      const filter = contract.filters.Transfer(null, address);
      const events = await contract.queryFilter(filter, fromBlock, latestBlock);

      // Normalize to same shape as Glacier response
      return events.map((e: any) => ({
        txHash:      e.transactionHash,
        blockNumber: String(e.blockNumber),
        from:        { address: e.args?.[0] ?? "" },
        to:          { address: e.args?.[1] ?? address },
        value:       e.args?.[2]?.toString() ?? "0",
        erc20Token:  { contractAddress },
      }));
    } catch (err: any) {
      logger.error({ err: err.message, address }, "RPC transfer lookup failed");
      return [];
    }
  }

  async getTransaction(txHash: string) {
    if (this.apiKey) {
      const res = await axios.get(
        `${this.baseUrl}/v1/chains/43114/transactions/${txHash}`,
        { headers: { "x-glacier-api-key": this.apiKey } }
      );
      return res.data;
    }
    // Fallback: use public RPC
    const provider = new ethers.JsonRpcProvider(AVAX_PUBLIC_RPC);
    return provider.getTransaction(txHash);
  }
}
