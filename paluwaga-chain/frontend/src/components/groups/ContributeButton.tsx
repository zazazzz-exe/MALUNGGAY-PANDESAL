import { useState } from "react";
import { useFreighter } from "../../hooks/useFreighter";
import { sorobanService } from "../../services/SorobanService";
import { useGroupStore } from "../../store/groupStore";

interface ContributeButtonProps {
  groupId: string;
  groupName: string;
  recipientAddress: string;
  amount: string;
  onSuccess: (hash: string) => void;
}

const ContributeButton = ({ groupId, groupName, recipientAddress, amount, onSuccess }: ContributeButtonProps) => {
  const { publicKey } = useFreighter();
  const recordContribution = useGroupStore((state) => state.recordContribution);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContribute = async () => {
    if (!publicKey) {
      setError("Connect your wallet first.");
      return;
    }

    if (!recipientAddress) {
      setError("Recipient address is missing.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const hash = await sorobanService.sendNativePayment(publicKey, recipientAddress, amount);

      recordContribution({
        groupId,
        groupName,
        amount,
        asset: "XLM",
        hash,
        memberAddress: publicKey
      });
      onSuccess(hash);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Contribution failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void handleContribute()}
        disabled={isSubmitting}
        className="primary-button inline-flex w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending XLM via Freighter..." : `Transfer ${amount} XLM`}
      </button>
      {error && <p className="text-xs text-rose-700">{error}</p>}
    </div>
  );
};

export default ContributeButton;
