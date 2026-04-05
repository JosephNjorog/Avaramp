import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Deployment script for AvaRamp smart contracts.
 *
 * Environment variables required:
 *   DEPLOYER_PRIVATE_KEY   — deployer wallet private key
 *   TREASURY_ADDRESS       — founder multisig / treasury address
 *   USDC_ADDRESS           — USDC token address on target network
 *   PROTOCOL_FEE_BPS       — default fee in basis points (e.g. 150 = 1.5%)
 *
 * Fuji testnet USDC: 0x5425890298aed601595a70AB815c96711a31Bc65
 * Mainnet USDC:      0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
 *
 * Usage:
 *   npx hardhat run scripts/deploy.ts --network fuji
 *   npx hardhat run scripts/deploy.ts --network avalanche
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX");

  // ── Config ────────────────────────────────────────────────────────────────

  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const usdcAddress     = process.env.USDC_ADDRESS;
  const feeBps          = Number(process.env.PROTOCOL_FEE_BPS ?? "150"); // default 1.5%

  if (!treasuryAddress || !usdcAddress) {
    throw new Error("Set TREASURY_ADDRESS and USDC_ADDRESS in .env");
  }

  console.log("\n── Deploy Parameters ──────────────────────────────────");
  console.log("  USDC address   :", usdcAddress);
  console.log("  Treasury       :", treasuryAddress);
  console.log("  Protocol fee   :", feeBps, "bps (", feeBps / 100, "%)");
  console.log("────────────────────────────────────────────────────────\n");

  // ── 1. MerchantRegistry ───────────────────────────────────────────────────

  console.log("Deploying MerchantRegistry...");
  const MerchantRegistry = await ethers.getContractFactory("MerchantRegistry");
  const registry = await MerchantRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("  MerchantRegistry deployed to:", registryAddress);

  // ── 2. PaymentGateway ─────────────────────────────────────────────────────

  console.log("Deploying PaymentGateway...");
  const PaymentGateway = await ethers.getContractFactory("PaymentGateway");
  const gateway = await PaymentGateway.deploy(
    deployer.address,   // admin
    usdcAddress,
    registryAddress,
    feeBps,
    treasuryAddress
  );
  await gateway.waitForDeployment();
  const gatewayAddress = await gateway.getAddress();
  console.log("  PaymentGateway deployed to:", gatewayAddress);

  // ── 3. Wire gateway → registry ────────────────────────────────────────────

  console.log("Granting GATEWAY_ROLE to PaymentGateway in registry...");
  const tx = await (registry as any).setGateway(gatewayAddress);
  await tx.wait();
  console.log("  Done. PaymentGateway can now call recordSettlement().");

  // ── 4. Summary ────────────────────────────────────────────────────────────

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║            DEPLOYMENT COMPLETE                      ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  MerchantRegistry : ${registryAddress} ║`);
  console.log(`║  PaymentGateway   : ${gatewayAddress} ║`);
  console.log("╚══════════════════════════════════════════════════════╝");

  console.log("\nNext steps:");
  console.log("  1. Copy contract addresses to backend/.env");
  console.log("     PAYMENT_GATEWAY_ADDRESS=" + gatewayAddress);
  console.log("     MERCHANT_REGISTRY_ADDRESS=" + registryAddress);
  console.log("  2. Verify contracts:");
  console.log(`     npx hardhat verify --network <network> ${registryAddress} "${deployer.address}"`);
  console.log(`     npx hardhat verify --network <network> ${gatewayAddress} "${deployer.address}" "${usdcAddress}" "${registryAddress}" ${feeBps} "${treasuryAddress}"`);
  console.log("  3. Register initial merchants via OPERATOR_ROLE");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
