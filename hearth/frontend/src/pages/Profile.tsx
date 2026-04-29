import { useMemo } from "react";
import AddressDisplay from "../components/ui/AddressDisplay";
import { useFreighter } from "../hooks/useFreighter";
import { useReceivedNative } from "../hooks/useReceivedNative";
import { useGroupStore } from "../store/groupStore";
import { useAuthStore } from "../store/authStore";
import { formatTimestamp } from "../lib/format";

const formatXlm = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }
  if (value >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

const Profile = () => {
  const { publicKey, network, isConnected } = useFreighter();
  const { groups, contributionHistory } = useGroupStore();
  const activeUser = useAuthStore((state) => state.activeUser);
  const { data: receivedNative = 0 } = useReceivedNative(publicKey);

  const totalTendedXlm = useMemo(() => {
    if (!publicKey) {
      return 0;
    }
    return contributionHistory
      .filter((entry) => entry.memberAddress === publicKey && (entry.asset || "XLM") === "XLM")
      .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  }, [contributionHistory, publicKey]);

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-[28px] bg-[linear-gradient(165deg,#FAF3E7_0%,#FFFBF2_45%,#F0E5D0_100%)] px-4 py-6 text-wood md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold">Profile</h1>
        {activeUser && <p className="text-lg font-semibold text-ember-deep">{activeUser.name}</p>}
      </div>

      <div className="glass-soft rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Account</p>
        {activeUser && (
          <p className="mt-2 text-sm text-wood-soft">
            <span className="font-semibold">Email:</span> {activeUser.email}
          </p>
        )}
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-wood-soft/70">
          Stellar address
        </p>
        {isConnected && publicKey ? (
          <div className="mt-2 space-y-2">
            <AddressDisplay address={publicKey} />
            <p className="mono break-all text-xs text-wood-soft/70">{publicKey}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-wood-soft">No address connected.</p>
        )}
        <p className="mt-3 text-sm text-wood-soft">
          Network: {network || "Unknown"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="glass-soft interactive-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Hearths joined</p>
          <p className="mt-2 font-display text-3xl font-bold text-ember">{groups.length}</p>
        </article>
        <article className="glass-soft interactive-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Tended</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber">{formatXlm(totalTendedXlm)} XLM</p>
        </article>
        <article className="glass-soft interactive-card p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Warmth received</p>
          <p className="mt-2 font-display text-3xl font-bold text-success">{formatXlm(receivedNative)} XLM</p>
        </article>
      </div>

      <div className="glass-soft p-4">
        <p className="font-semibold text-wood">Recent Tendings</p>
        {contributionHistory.length === 0 ? (
          <p className="mt-2 text-sm text-wood-soft">No tending history yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-wood-soft">
            {contributionHistory.slice(0, 5).map((entry) => (
              <li key={entry.id}>
                {entry.amount} {entry.asset || "XLM"} sent to {entry.groupName} on{" "}
                {formatTimestamp(entry.createdAt)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Profile;
