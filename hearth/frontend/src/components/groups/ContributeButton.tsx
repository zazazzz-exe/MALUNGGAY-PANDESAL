import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFreighter } from "../../hooks/useFreighter";
import { useNicknames } from "../../hooks/useNicknames";
import { sorobanService } from "../../services/SorobanService";
import { useGroupStore } from "../../store/groupStore";
import { truncateAddress } from "../../lib/format";
import ConfirmModal from "../ui/ConfirmModal";

interface ContributeButtonProps {
  groupId: string;
  groupName: string;
  recipientAddress: string;
  amount: string;
  onSuccess: (hash: string) => void;
}

const ContributeButton = ({
  groupId,
  groupName,
  recipientAddress,
  amount,
  onSuccess
}: ContributeButtonProps) => {
  const { publicKey } = useFreighter();
  const queryClient = useQueryClient();
  const { getNickname } = useNicknames();
  const recordContribution = useGroupStore((state) => state.recordContribution);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const recipientNickname = recipientAddress ? getNickname(recipientAddress) : null;
  const recipientLabel = recipientNickname || (recipientAddress ? truncateAddress(recipientAddress) : "Kin");

  const validate = (): string | null => {
    if (!publicKey) {
      return "Connect Freighter first.";
    }
    if (!recipientAddress) {
      return "Kin address is missing.";
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return "Enter a valid amount.";
    }
    return null;
  };

  const handleClick = () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setConfirming(true);
  };

  const handleConfirm = async () => {
    if (!publicKey) {
      return;
    }

    setIsSubmitting(true);

    try {
      const hash = await sorobanService.sendNativePayment(
        publicKey,
        recipientAddress,
        amount
      );

      recordContribution({
        groupId,
        groupName,
        amount,
        asset: "XLM",
        hash,
        memberAddress: publicKey
      });

      // Force subscribed views (Dashboard cards, GroupDetail, Profile) to refetch
      // on-chain + Horizon data immediately, instead of waiting for the next poll.
      void queryClient.invalidateQueries({ queryKey: ["group-state"] });
      void queryClient.invalidateQueries({ queryKey: ["received-native"] });
      void queryClient.invalidateQueries({ queryKey: ["member-info"] });

      setConfirming(false);
      onSuccess(hash);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Tending failed.";
      setError(message);
      setConfirming(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isSubmitting}
        className="primary-button inline-flex w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending warmth..." : `Tend ${amount} XLM`}
      </button>
      {error && <p className="text-xs text-error">{error}</p>}

      <ConfirmModal
        open={confirming}
        title={`Send ${amount} XLM to ${recipientLabel}?`}
        body={
          <>
            This sends {amount} XLM directly from your Stellar address.
            Once confirmed, it can&rsquo;t be undone.
          </>
        }
        specifics={
          <dl className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-wood-soft/70">
                Amount
              </dt>
              <dd className="font-display text-lg font-semibold text-wood">
                {amount} XLM
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-wood-soft/70">
                To
              </dt>
              <dd className="text-right text-sm">
                {recipientNickname && (
                  <span className="block font-semibold text-wood">
                    {recipientNickname}
                  </span>
                )}
                <span className="mono text-[11px] text-wood-soft/80">
                  {truncateAddress(recipientAddress, 6, 6)}
                </span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-wood-soft/70">
                Hearth
              </dt>
              <dd className="text-sm text-wood">{groupName}</dd>
            </div>
          </dl>
        }
        feeText="Estimated network fee: ~0.00001 XLM (less than ₱0.01)"
        cancelLabel="Not yet"
        confirmLabel={`Send ${amount} XLM`}
        isSubmitting={isSubmitting}
        onCancel={() => {
          if (!isSubmitting) {
            setConfirming(false);
          }
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default ContributeButton;
