import { ethers } from "ethers";
import { encrypt, decrypt } from "../../shared/Utils/Encryption";
import { logger } from "../../shared/Utils/Logger";

const USDC_ADDRESS = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];
// Enough native AVAX for one ERC-20 transfer on Avalanche C-Chain
const GAS_TOPUP_AVAX = "0.002";

/**
 * Generates a fresh Ethereum-compatible wallet for use as a USDC deposit address.
 * The private key is AES-256-GCM encrypted before storage.
 */
export class WalletService {
  generateDepositWallet(): { address: string; encryptedPk: string } {
    const wallet = ethers.Wallet.createRandom();
    const encryptedPk = encrypt(wallet.privateKey);
    return { address: wallet.address, encryptedPk };
  }

  decryptPrivateKey(encryptedPk: string): string {
    return decrypt(encryptedPk);
  }

  /**
   * Derive a deterministic wallet from the HD mnemonic at a given index.
   * Use this if you prefer HD wallet derivation over random wallets.
   */
  deriveWallet(index: number): { address: string; encryptedPk: string } {
    const mnemonic = process.env.HD_MNEMONIC!;
    const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
    const wallet = hdNode.deriveChild(index);
    const encryptedPk = encrypt(wallet.privateKey);
    return { address: wallet.address, encryptedPk };
  }

  /**
   * Forwards the full USDC balance of a per-payment deposit address to a
   * settlement provider's receiving address, so the provider can verify the
   * transfer on-chain before releasing a fiat payout. Fresh deposit addresses
   * hold no native AVAX, so this tops up gas from OPERATOR_PRIVATE_KEY first.
   */
  async sweepUsdcTo(encryptedPk: string, toAddress: string): Promise<string> {
    const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL!);
    const depositWallet = new ethers.Wallet(this.decryptPrivateKey(encryptedPk), provider);
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

    const balance: bigint = await usdc.balanceOf(depositWallet.address);
    if (balance === 0n) {
      throw new Error(`Deposit address ${depositWallet.address} has zero USDC balance — nothing to sweep`);
    }

    const gasTopUp = ethers.parseEther(GAS_TOPUP_AVAX);
    const nativeBalance = await provider.getBalance(depositWallet.address);
    if (nativeBalance < gasTopUp) {
      const operatorKey = process.env.OPERATOR_PRIVATE_KEY;
      if (!operatorKey) {
        throw new Error("OPERATOR_PRIVATE_KEY is required to fund gas for settlement sweeps");
      }
      const operator = new ethers.Wallet(operatorKey, provider);
      const topUpTx = await operator.sendTransaction({
        to: depositWallet.address,
        value: gasTopUp - nativeBalance,
      });
      await topUpTx.wait();
      logger.info({ address: depositWallet.address }, "Gas top-up sent for settlement sweep");
    }

    const tx = await usdc.connect(depositWallet).getFunction("transfer")(toAddress, balance);
    const receipt = await tx.wait();
    logger.info({ from: depositWallet.address, toAddress, txHash: receipt.hash }, "USDC swept to settlement address");
    return receipt.hash as string;
  }
}

export const walletService = new WalletService();
