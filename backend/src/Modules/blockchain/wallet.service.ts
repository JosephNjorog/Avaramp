import { ethers } from "ethers";
import { encrypt, decrypt } from "../../shared/Utils/Encryption";

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
}

export const walletService = new WalletService();
