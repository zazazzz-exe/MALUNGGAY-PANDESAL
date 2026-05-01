import { useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import ContributeButton from "../components/groups/ContributeButton";
import TransactionToast from "../components/ui/TransactionToast";
import AddressDisplay from "../components/ui/AddressDisplay";
import { useFreighter } from "../hooks/useFreighter";
import { useNicknames } from "../hooks/useNicknames";
import { useGroupStore } from "../store/groupStore";
import {
  computeNextDue,
  formatDueDate,
  formatTimestamp,
  NextDueTone,
  truncateAddress
} from "../lib/format";

const NEXT_DUE_TONE_CLASSES: Record<NextDueTone, string> = {
  neutral: "border-warmgray/70 bg-cream/70 text-wood-soft",
  scheduled: "border-warmgray/70 bg-amber-soft/40 text-wood",
  due: "border-ember/40 bg-ember/10 text-ember-deep",
  overdue: "border-error/40 bg-error/10 text-error"
};

interface ReceiptState {
  hash: string;
  amount: string;
  recipient: string;
  recipientLabel: string;
  timestamp: string;
}

const GroupDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptState | null>(null);
  const [transferAmount, setTransferAmount] = useState("1");
  const { publicKey } = useFreighter();
  const { getNickname } = useNicknames();
  const routeGroup = (location.state as { group?: { id: string; name: string; memberPreview?: string[]; contributionAmount?: string; source?: "live" | "created" } } | null)?.group;
  const storedGroup = useGroupStore((state) => state.groups.find((group) => group.id === id));
  const allContributionHistory = useGroupStore((state) => state.contributionHistory || []);
  const contributionHistory = useMemo(
    () => allContributionHistory.filter((entry) => entry.groupId === (id || "onchain-group")),
    [allContributionHistory, id]
  );

  const fallbackGroup = routeGroup || storedGroup;
  const groupName = fallbackGroup?.name || (id ? `Hearth ${id.slice(0, 6)}` : "Your Hearth");
  const isDraftGroup = fallbackGroup?.source === "created";

  const lastSendAt = useMemo(() => {
    if (!contributionHistory.length) return null;
    return contributionHistory.reduce((latest, entry) =>
      entry.createdAt.localeCompare(latest) > 0 ? entry.createdAt : latest,
      contributionHistory[0].createdAt
    );
  }, [contributionHistory]);

  const nextDue = useMemo(
    () => computeNextDue(lastSendAt, storedGroup?.rotationFrequencyDays ?? null),
    [lastSendAt, storedGroup?.rotationFrequencyDays]
  );

  const recipientAddress = useMemo(() => {
    const preview = Array.isArray(fallbackGroup?.memberPreview) ? fallbackGroup?.memberPreview : [];
    return preview[0] || "";
  }, [fallbackGroup]);

  const recipientNickname = recipientAddress ? getNickname(recipientAddress) : null;

  const handleTendSuccess = (hash: string) => {
    const recipientLabel =
      recipientNickname || (recipientAddress ? truncateAddress(recipientAddress) : "Kin");
    setReceipt({
      hash,
      amount: transferAmount,
      recipient: recipientAddress,
      recipientLabel,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <section className="mx-auto flex max-w-[900px] flex-col gap-6 rounded-[28px] bg-[linear-gradient(165deg,#FAF3E7_0%,#FFFBF2_45%,#F0E5D0_100%)] px-4 py-6 text-wood md:px-6">
      <nav className="glass-soft flex items-center gap-4 rounded-[20px] px-5 py-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-wood-soft transition hover:bg-amber-soft/40 hover:text-ember-deep"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to your Hearths
        </button>
        <div className="flex-1 border-l border-warmgray/70" />
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-wood-soft transition hover:bg-amber-soft/40 hover:text-ember-deep"
        >
          <span className="material-symbols-outlined text-lg">view_comfy</span>
          All Hearths
        </button>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-wood-soft transition hover:bg-amber-soft/40 hover:text-ember-deep"
        >
          <span className="material-symbols-outlined text-lg">person</span>
          Profile
        </button>
      </nav>

      <header className="glass-soft rounded-[24px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Hearth Detail</p>
            <h1 className="font-display text-4xl font-bold">{groupName}</h1>
            <p className="mt-2 text-sm text-wood-soft">Send XLM straight to your Kin&rsquo;s Stellar wallet, on your schedule.</p>
          </div>
          <div
            className={`rounded-full px-4 py-2 text-xs font-bold ${
              isDraftGroup ? "bg-amber-soft/70 text-ember-deep" : "bg-amber text-wood"
            }`}
            title={
              isDraftGroup
                ? "This Hearth lives only on this device."
                : "Saved Hearth — ready to send."
            }
          >
            {isDraftGroup ? "Draft" : "Saved"}
          </div>
        </div>
      </header>

      {nextDue && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-[20px] border px-5 py-4 text-sm ${NEXT_DUE_TONE_CLASSES[nextDue.tone]}`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              {nextDue.tone === "overdue"
                ? "warning"
                : nextDue.tone === "due"
                  ? "local_fire_department"
                  : "schedule"}
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] opacity-80">Next warmth</p>
              <p className="mt-0.5 font-display text-lg font-semibold">
                {nextDue.label}
                {nextDue.hasHistory && (
                  <span className="ml-2 text-sm font-normal opacity-80">
                    ({formatDueDate(nextDue.dueAt)})
                  </span>
                )}
              </p>
            </div>
          </div>
          {lastSendAt && (
            <p className="text-xs opacity-75">
              Last sent {formatTimestamp(lastSendAt)}
            </p>
          )}
        </div>
      )}

      <article className="glass-soft p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Send XLM</p>
        <div className="mt-3 rounded-2xl border border-warmgray/70 bg-white/75 px-4 py-3 text-sm text-wood-soft">
          This sends native XLM directly from your Stellar address to the Kin saved on this Hearth.
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-bold text-wood">
              {publicKey ? "Send from Freighter" : "Connect Freighter to send"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-wood-soft">
              <span>Kin:</span>
              <AddressDisplay address={recipientAddress} />
            </div>
            <label className="mt-3 block text-sm font-semibold text-wood-soft">
              Amount (XLM)
              <input
                type="number"
                min="0.0000001"
                step="0.0000001"
                value={transferAmount}
                onChange={(event) => setTransferAmount(event.target.value)}
                className="mt-2 w-full rounded-xl border border-warmgray/70 bg-white/85 px-3 py-2 text-wood outline-none focus:border-ember"
              />
            </label>
          </div>
          <ContributeButton
            groupId={id || "onchain-group"}
            groupName={groupName}
            recipientAddress={recipientAddress}
            amount={transferAmount}
            onSuccess={handleTendSuccess}
          />
        </div>
      </article>

      <article className="glass-soft p-6 text-wood">
        <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Tending History</p>
        {contributionHistory.length === 0 ? (
          <p className="mt-4 text-sm text-wood-soft">No tending recorded yet for this Hearth.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {contributionHistory.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-warmgray/70 bg-white/75 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-wood">
                      {entry.amount} {entry.asset || "XLM"} sent
                    </p>
                    <div className="mt-1 text-xs text-wood-soft/80">
                      <AddressDisplay address={entry.memberAddress} size="xs" />
                    </div>
                    <p className="mt-1 text-[11px] text-wood-soft/70">
                      {formatTimestamp(entry.createdAt)}
                    </p>
                  </div>
                  <a
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ember hover:text-ember-deep"
                    href={`https://stellar.expert/explorer/testnet/tx/${entry.hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on Stellar Expert <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {receipt && (
        <TransactionToast
          status="success"
          hash={receipt.hash}
          primary={`${receipt.amount} XLM sent to ${receipt.recipientLabel}`}
          detail={formatTimestamp(receipt.timestamp)}
          feeText="Network fee: ~0.00001 XLM (less than ₱0.01)"
          onClose={() => setReceipt(null)}
        />
      )}
    </section>
  );
};

export default GroupDetail;
