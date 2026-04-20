export const stellarConfig = {
  sorobanRpcUrl: import.meta.env.VITE_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
  horizonUrl: import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org",
  contractId: import.meta.env.VITE_CONTRACT_ID || "",
  usdcIssuer: import.meta.env.VITE_USDC_ISSUER || "",
  networkPassphrase:
    import.meta.env.VITE_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015"
};

export const isTestnet = (network: string | undefined): boolean =>
  (network || "").toLowerCase().includes("test");
