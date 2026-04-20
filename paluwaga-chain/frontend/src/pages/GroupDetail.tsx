import { useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import CountdownTimer from "../components/groups/CountdownTimer";
import ContributeButton from "../components/groups/ContributeButton";
import MemberList from "../components/groups/MemberList";
import RotationTimeline from "../components/groups/RotationTimeline";
import TransactionToast from "../components/ui/TransactionToast";
import { useGroupState } from "../hooks/useGroupState";
import { useFreighter } from "../hooks/useFreighter";
import { useGroupStore } from "../store/groupStore";

const toShortAddress = (value: unknown): string => {
  if (typeof value !== "string") {
    return "Unknown";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "Unknown";
  }

  if (trimmed.length <= 14) {
    return trimmed;
  }

  return `${trimmed.slice(0, 8)}...${trimmed.slice(-6)}`;
};

const GroupDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [latestHash, setLatestHash] = useState<string | undefined>(undefined);
  const [transferAmount, setTransferAmount] = useState("1");
  const { publicKey } = useFreighter();
  const { data, isLoading } = useGroupState();
  const routeGroup = (location.state as { group?: { id: string; name: string; memberPreview?: string[]; contributionAmount?: string; source?: "live" | "created" } } | null)?.group;
  const storedGroup = useGroupStore((state) => state.groups.find((group) => group.id === id));
  const allContributionHistory = useGroupStore((state) => state.contributionHistory || []);
  const contributionHistory = useMemo(
    () => allContributionHistory.filter((entry) => entry.groupId === (id || "onchain-group")),
    [allContributionHistory, id]
  );

  const members = useMemo(() => {
    const fallbackGroup = routeGroup || storedGroup;
    const fallbackPreview = Array.isArray(fallbackGroup?.memberPreview) ? fallbackGroup.memberPreview : [];

    if (!data && fallbackPreview.length) {
      return fallbackPreview.map((address: string, index: number) => ({
        address,
        hasPaid: false,
        turn: index + 1,
        isCurrent: index === 0,
        isUpcoming: index > 0
      }));
    }

    const storedPreview = Array.isArray(storedGroup?.memberPreview) ? storedGroup.memberPreview : [];

    if (!data && storedPreview.length) {
      return storedPreview.map((address: string, index: number) => ({
        address,
        hasPaid: false,
        turn: index + 1,
        isCurrent: index === 0,
        isUpcoming: index > 0
      }));
    }

    const rawMembers = data?.members ?? data?.Members ?? [];
    const paidStatus = data?.paid_status ?? data?.paidStatus ?? {};
    return Array.isArray(rawMembers)
      ? rawMembers.map((member: any, index: number) => {
          const address = typeof member === "string" ? member : typeof member?.address === "string" ? member.address : "";
          const hasPaid = Boolean(paidStatus?.[address] ?? paidStatus?.[member] ?? false);
          return {
            address,
            hasPaid,
            turn: index + 1,
            isCurrent: index === Number(data?.rotation_index ?? 0),
            isUpcoming: index > Number(data?.rotation_index ?? 0)
          };
        })
      : [];
  }, [data, storedGroup, routeGroup]);

  const currentRound = Number(data?.round ?? 1);
  const poolBalance = String(data?.pool_balance ?? 0);
  const fallbackGroup = routeGroup || storedGroup;
  const groupName = fallbackGroup?.name || (id ? `Group ${id.slice(0, 6)}` : "PaluwagaChain Group");
  const isDraftGroup = fallbackGroup?.source === "created";

  const recipientAddress = useMemo(() => {
    const raw = data?.next_recipient ?? data?.nextRecipient;
    if (typeof raw === "string" && raw.trim()) {
      return raw;
    }
    if (raw && typeof raw === "object" && "address" in raw) {
      const value = (raw as { address?: unknown }).address;
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
    return members[0]?.address || "";
  }, [data, members]);

  return (
    <section className="mx-auto flex max-w-[900px] flex-col gap-6 px-4 py-6 text-white md:px-0">
      <nav className="flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Dashboard
        </button>
        <div className="flex-1 border-l border-white/10" />
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <span className="material-symbols-outlined text-lg">view_comfy</span>
          All Groups
        </button>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <span className="material-symbols-outlined text-lg">person</span>
          Profile
        </button>
      </nav>

      <header className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Group Detail</p>
            <h1 className="font-display text-4xl font-extrabold">{groupName}</h1>
            <p className="mt-2 text-sm text-white/65">Creation date and status are derived from your live Soroban contract state.</p>
          </div>
          <div className={`rounded-full px-4 py-2 text-xs font-bold ${isDraftGroup ? "bg-white/10 text-white" : "bg-[#F5A623] text-[#3F2200]"}`}>
            {isDraftGroup ? "Draft" : "Active"}
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="glass-panel rounded-[20px] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Rotation Timeline</p>
          <div className="mt-4">{isLoading ? <p className="text-sm text-white/60">Loading live rotation...</p> : <RotationTimeline members={members.map((m) => m.address)} currentIndex={Number(data?.rotation_index ?? 0)} />}</div>
        </article>

        <article className="glass-panel rounded-[20px] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Pool Balance</p>
          <p className="mt-3 text-4xl font-extrabold text-[#00C6FF]">USDC {poolBalance}</p>
          <p className="mt-2 text-sm text-white/60">Release unlocks when all members contribute.</p>
          <div className="mt-5">
            <CountdownTimer targetDate={new Date(Date.now() + 3 * 86400000 + 14 * 3600000).toISOString()} />
          </div>
        </article>
      </div>

      <article className="rounded-[24px] border border-white/10 bg-white p-4 text-[#0D1F3C] shadow-[0_25px_60px_rgba(0,0,0,0.18)]">
        <MemberList members={members} />
      </article>

      <article className="glass-panel rounded-[24px] p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Transfer XLM</p>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          This action sends native XLM directly from your Freighter wallet. It does not require join-group contract membership.
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">Round {currentRound} of {members.length || 1}</p>
            <p className="mt-1 text-2xl font-bold text-white">{publicKey ? "Send from Freighter now" : "Connect wallet to continue"}</p>
            <p className="mt-2 text-sm text-white/55">Recipient: <span className="mono">{toShortAddress(recipientAddress)}</span></p>
            {isDraftGroup && <p className="mt-2 text-sm text-white/55">This group is stored locally; transfer target falls back to first listed member.</p>}
            <label className="mt-3 block text-sm font-semibold text-white/75">
              Amount (XLM)
              <input
                type="number"
                min="0.0000001"
                step="0.0000001"
                value={transferAmount}
                onChange={(event) => setTransferAmount(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
              />
            </label>
          </div>
          <ContributeButton
            groupId={id || "onchain-group"}
            groupName={groupName}
            recipientAddress={recipientAddress}
            amount={transferAmount}
            onSuccess={(hash) => setLatestHash(hash)}
          />
        </div>
      </article>

      <article className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-white backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Contribution History</p>
        {contributionHistory.length === 0 ? (
          <p className="mt-4 text-sm text-white/65">No contributions recorded yet for this group.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {contributionHistory.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-[#0A1628] px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{entry.amount} {entry.asset || "XLM"} transferred</p>
                    <p className="mono mt-1 text-xs text-white/55">{toShortAddress(entry.memberAddress)}</p>
                  </div>
                  <a className="text-xs text-[#00C6FF] underline" href={`https://stellar.expert/explorer/testnet/tx/${entry.hash}`} target="_blank" rel="noreferrer">
                    View transaction
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {latestHash && <TransactionToast hash={latestHash} status="success" message="Your contribution has been sent on-chain." onClose={() => setLatestHash(undefined)} />}
    </section>
  );
};

export default GroupDetail;
