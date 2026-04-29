import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFreighter } from "../../hooks/useFreighter";
import { useNicknames } from "../../hooks/useNicknames";
import NetworkBadge from "./NetworkBadge";
import { useAuthStore } from "../../store/authStore";
import AddressDisplay from "../ui/AddressDisplay";

const truncateAddress = (value: string) => `${value.slice(0, 4)}...${value.slice(-4)}`;

const ConnectWalletButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isInstalled, isConnected, publicKey, network, connect, disconnect, isLoading, error } = useFreighter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { getNickname } = useNicknames();
  const nickname = publicKey ? getNickname(publicKey) : null;

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    navigate("/");
  };

  if (!isInstalled) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-ember bg-transparent px-5 py-3 text-sm font-semibold text-ember"
      >
        <span className="material-symbols-outlined text-base">account_balance_wallet</span>
        Install Freighter
      </a>
    );
  }

  if (!isConnected || !publicKey) {
    if (!isAuthenticated) {
      return (
        <button
          type="button"
          onClick={() => navigate("/auth?redirect=/dashboard")}
          className="primary-button inline-flex items-center gap-2 px-5 py-3 text-sm"
        >
          <span className="material-symbols-outlined text-base">person</span>
          Sign in to connect
        </button>
      );
    }

    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => void connect()}
          disabled={isLoading}
          className="primary-button inline-flex items-center gap-2 px-5 py-3 text-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">account_balance_wallet</span>
          {isLoading ? "Connecting..." : "Connect Freighter"}
        </button>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <NetworkBadge network={network} />
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass-soft inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-ember-deep"
      >
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className={`text-[14px] font-medium ${nickname ? "" : "mono"}`}>
          {nickname || truncateAddress(publicKey)}
        </span>
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>

      {isOpen && (
        <div className="glass-soft absolute right-0 top-14 z-50 w-80 rounded-xl p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-wood-soft/70">
            Connected address
          </p>
          <div className="mt-2 rounded-lg bg-white/70 px-3 py-2">
            <AddressDisplay address={publicKey} />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="mono break-all text-[11px] text-wood-soft/80">{publicKey}</p>
              <button
                type="button"
                className="text-xs text-ember hover:text-ember-deep"
                onClick={() => void navigator.clipboard.writeText(publicKey)}
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-wood-soft">Network</span>
            <NetworkBadge network={network} />
          </div>

          <button
            type="button"
            onClick={handleDisconnect}
            className="danger-button mt-3 w-full text-sm"
          >
            Step away
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletButton;
