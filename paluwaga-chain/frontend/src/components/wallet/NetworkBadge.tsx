interface NetworkBadgeProps {
  network: string | null;
}

const NetworkBadge = ({ network }: NetworkBadgeProps) => {
  const normalized = (network || "").toLowerCase();
  const isTestnet = normalized.includes("test");

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.14em] ${
        isTestnet ? "bg-[#F5A623] text-[#3F2200]" : "bg-[#27AE60] text-white"
      }`}
    >
      {isTestnet ? "TESTNET" : "MAINNET"}
    </span>
  );
};

export default NetworkBadge;
