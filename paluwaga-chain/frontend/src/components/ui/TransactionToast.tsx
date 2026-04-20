import { useEffect } from "react";

type ToastStatus = "success" | "error" | "loading";

interface TransactionToastProps {
  hash?: string;
  message?: string;
  status?: ToastStatus;
  onClose: () => void;
}

const TransactionToast = ({
  hash,
  message,
  status = "success",
  onClose
}: TransactionToastProps) => {
  const link = hash ? `https://stellar.expert/explorer/testnet/tx/${hash}` : "";

  useEffect(() => {
    const timer = setTimeout(() => onClose(), 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const statusStyle =
    status === "success"
      ? "border-l-[#27AE60]"
      : status === "error"
        ? "border-l-[#E74C3C]"
        : "border-l-[#00C6FF]";

  const title =
    status === "success" ? "Transaction confirmed" : status === "error" ? "Transaction failed" : "Submitting to Stellar...";

  return (
    <div className={`fixed bottom-5 right-5 z-50 w-[360px] rounded-xl border border-white/20 border-l-4 bg-[#0A1628] p-4 shadow-[0_25px_70px_rgba(0,0,0,0.35)] ${statusStyle}`}>
      <p className="text-sm font-semibold text-white">{title}</p>
      {message && <p className="mt-2 text-xs text-white/70">{message}</p>}
      {hash && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mono mt-2 block break-all text-xs text-[#00C6FF] underline"
        >
          {hash}
        </a>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-3 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/15"
      >
        Dismiss
      </button>
    </div>
  );
};

export default TransactionToast;
