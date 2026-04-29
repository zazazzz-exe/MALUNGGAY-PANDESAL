import { useEffect } from "react";

type ToastStatus = "success" | "error" | "loading";

interface TransactionToastProps {
  open?: boolean;
  status?: ToastStatus;
  hash?: string;
  /** Big primary line, e.g. "₱11,200 sent to Mom" (success) or short error text. */
  primary: string;
  /** Smaller line under primary, e.g. "200 USDC • Mon, Apr 27, 8:14 AM". */
  detail?: string;
  /** Optional fee preview shown small under the detail. */
  feeText?: string;
  /** Optional friendly error text when status === "error". */
  errorMessage?: string;
  onClose: () => void;
}

const TransactionToast = ({
  open = true,
  status = "success",
  hash,
  primary,
  detail,
  feeText,
  errorMessage,
  onClose
}: TransactionToastProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    if (status === "loading") {
      return;
    }
    const timer = setTimeout(() => onClose(), status === "success" ? 9000 : 6000);
    return () => clearTimeout(timer);
  }, [open, onClose, status]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const explorerLink = hash
    ? `https://stellar.expert/explorer/testnet/tx/${hash}`
    : null;

  if (status === "success") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 sm:items-center sm:pb-0"
      >
        <button
          type="button"
          aria-label="Dismiss"
          className="absolute inset-0 bg-wood/45 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-md rounded-[28px] border border-amber/50 bg-cream p-7 text-center shadow-[0_28px_72px_rgba(58,36,24,0.30)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-soft text-3xl text-ember-deep shadow-[0_0_28px_rgba(255,201,122,0.65)]">
            ✓
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-wood-soft/80">
            Done.
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-wood md:text-4xl">
            {primary}
          </p>
          {detail && (
            <p className="mt-2 text-sm text-wood-soft">{detail}</p>
          )}
          {feeText && (
            <p className="mt-3 text-xs text-wood-soft/75">{feeText}</p>
          )}
          {explorerLink && (
            <a
              href={explorerLink}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ember hover:text-ember-deep"
            >
              View on Stellar Expert
              <span aria-hidden="true">↗</span>
            </a>
          )}
          <div className="mt-6">
            <button
              type="button"
              onClick={onClose}
              className="primary-button px-8 py-3 text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error / loading: small bottom-right toast.
  const accent =
    status === "error" ? "border-l-error" : "border-l-ember";
  const title =
    status === "error" ? "Something didn’t go through" : "Sending to Stellar...";

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
      <div
        className={`rounded-2xl border border-warmgray/70 border-l-4 bg-cream p-4 shadow-[0_20px_60px_rgba(58,36,24,0.20)] ${accent}`}
      >
        <p className="text-sm font-semibold text-wood">{title}</p>
        {errorMessage && (
          <p className="mt-2 text-xs text-wood-soft">{errorMessage}</p>
        )}
        {primary && status !== "error" && (
          <p className="mt-2 text-xs text-wood-soft">{primary}</p>
        )}
        {explorerLink && (
          <a
            href={explorerLink}
            target="_blank"
            rel="noreferrer"
            className="mono mt-2 block break-all text-xs text-ember hover:text-ember-deep"
          >
            {hash}
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-3 rounded-lg bg-wood/5 px-3 py-1 text-xs font-semibold text-wood-soft transition hover:bg-wood/10"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default TransactionToast;
