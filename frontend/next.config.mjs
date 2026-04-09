/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  images: {
    domains: ["api.dicebear.com"],
  },
  webpack(config) {
    // wagmi v2 ships connectors (porto, coinbase smart wallet, base account)
    // that pull in optional native deps not installed in this project.
    // Alias them to false so webpack treats them as empty modules.
    config.resolve.alias = {
      ...config.resolve.alias,
      "porto/internal":          false,
      "porto":                   false,
      "@coinbase/cdp-sdk":       false,
      "@coinbase/wallet-sdk":    false,
      "@base-org/account":       false,
      "@metamask/connect-evm":   false,
      "@solana/web3.js":         false,
    };
    return config;
  },
};

export default nextConfig;
