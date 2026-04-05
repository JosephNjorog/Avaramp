import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_PK = process.env.DEPLOYER_PRIVATE_KEY ?? "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    fuji: {
      url:      "https://api.avax-test.network/ext/bc/C/rpc",
      chainId:  43113,
      accounts: [DEPLOYER_PK],
    },
    avalanche: {
      url:      process.env.AVALANCHE_RPC_URL ?? "https://api.avax.network/ext/bc/C/rpc",
      chainId:  43114,
      accounts: [DEPLOYER_PK],
    },
  },
  paths: {
    sources:   "./contracts",
    tests:     "./test",
    cache:     "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      avalanche:     process.env.SNOWTRACE_API_KEY ?? "",
      avalancheFuji: process.env.SNOWTRACE_API_KEY ?? "",
    },
    customChains: [
      {
        network: "avalanche",
        chainId: 43114,
        urls: {
          apiURL:     "https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan",
          browserURL: "https://snowtrace.io",
        },
      },
      {
        network: "avalancheFuji",
        chainId: 43113,
        urls: {
          apiURL:     "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan",
          browserURL: "https://testnet.snowtrace.io",
        },
      },
    ],
  },
  gasReporter: {
    enabled:  process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};

export default config;
