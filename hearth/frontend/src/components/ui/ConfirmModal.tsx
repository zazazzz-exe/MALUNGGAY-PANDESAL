import { ReactNode, useEffect } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  specifics?: ReactNode;
  feeText?: string;
  cancelLabel?: string;
  confirmLabel: string;
  variant?: "default" | "danger";
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const ConfirmModal = ({
  open,
  title,
  body,
  specifics,
  feeText,
  cancelLabel = "Cancel",
  confirmLabel,
  variant = "default",
  isSubmitting = false,
  onCancel,
  onConfirm
}: ConfirmModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isSubmitting, onCancel]);

  if (!open) {
    return null;
  }

  const confirmButton =
    variant === "danger"
      ? "danger-button px-5 py-3"
      : "primary-button px-5 py-3";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-wood/55 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) {
            onCancel();
          }
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-[24px] border border-warmgray/70 bg-cream p-6 shadow-[0_30px_80px_rgba(58,36,24,0.32)]">
        <h2
          id="confirm-modal-title"
          className="font-display text-2xl font-bold text-wood"
        >
          {title}
        </h2>
        {body && (
          <p className="mt-3 text-sm leading-relaxed text-wood-soft">{body}</p>
        )}
        {specifics && (
          <div className="mt-4 rounded-2xl border border-warmgray/70 bg-white/70 p-4 text-sm text-wood">
            {specifics}
          </div>
        )}
        {feeText && (
          <p className="mt-3 text-xs text-wood-soft/80">{feeText}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-wood-soft hover:text-wood disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
            className={`${confirmButton} text-sm disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isSubmitting ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
