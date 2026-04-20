import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GroupCard from "../components/groups/GroupCard";
import { useCountUp } from "../hooks/useCountUp";
import { useFreighter } from "../hooks/useFreighter";
import { useGroupState } from "../hooks/useGroupState";
import { useInViewAnimation } from "../hooks/useInViewAnimation";
import { useGroupStore, GroupSummary } from "../store/groupStore";

const toAddressString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "address" in value) {
    const maybe = (value as { address?: unknown }).address;
    return typeof maybe === "string" ? maybe : "";
  }
  return "";
};

const getArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && "vec" in value) {
    const maybe = (value as { vec?: unknown }).vec;
    return Array.isArray(maybe) ? maybe : [];
  }
  return [];
};

const normalizeGroupState = (state: any, publicKey: string | null): GroupSummary[] => {
  if (!state || !publicKey) return [];

  const members = getArray(state.members ?? state.Members ?? state.member_list ?? state.memberList)
    .map(toAddressString)
    .filter(Boolean);

  if (!members.length) return [];

  const memberIndex = members.findIndex((member) => member === publicKey);
  if (memberIndex === -1) return [];

  const round = Number(state.round ?? 1);
  const rotationIndex = Number(state.rotation_index ?? state.rotationIndex ?? 0);
  const poolBalance = String(state.pool_balance ?? state.poolBalance ?? 0);
  const paidStatus = state.paid_status ?? state.paidStatus;
  const contributedMembers =
    paidStatus && typeof paidStatus === "object"
      ? members.filter((member) => Boolean((paidStatus as Record<string, boolean>)[member])).length
      : undefined;

  return [
    {
      id: "onchain-group",
      name: "PaluwagaChain Circle",
      source: "live",
      yourTurn: memberIndex + 1,
      totalMembers: members.length,
      currentRound: Number.isNaN(round) ? 1 : round,
      totalRounds: members.length,
      poolBalance,
      contributedMembers,
      contributionAmount: String(state.contribution_amount ?? state.contributionAmount ?? "0"),
      rotationFrequencyDays: Number(state.rotation_interval_days ?? state.rotationIntervalDays ?? 7),
      hasPaid: Boolean((paidStatus as Record<string, boolean> | undefined)?.[publicKey]),
      status: contributedMembers === members.length ? "ready" : memberIndex + 1 === rotationIndex + 1 ? "your-turn" : "waiting",
      memberPreview: members.slice(0, 4),
      nextReleaseAt: new Date(Date.now() + (rotationIndex + 1) * 86400000).toISOString()
    }
  ];
};

const Dashboard = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarVisible = useInViewAnimation(sidebarRef);
  const { publicKey, disconnect } = useFreighter();
  const { data, isLoading, error } = useGroupState();
  const { groups, upsertGroups } = useGroupStore();
  const [activeTab, setActiveTab] = useState<"all" | "created">("all");

  const liveGroups = useMemo(() => normalizeGroupState(data, publicKey), [data, publicKey]);

  useEffect(() => {
    upsertGroups(liveGroups);
  }, [liveGroups, upsertGroups]);

  const visibleGroups = useMemo(() => {
    let filtered = [...groups].sort((left, right) => {
      if (left.source === right.source) {
        return (right.createdAt || "").localeCompare(left.createdAt || "");
      }

      if (left.source === "created") return -1;
      if (right.source === "created") return 1;

      return 0;
    });

    if (activeTab === "created") {
      filtered = filtered.filter((group) => group.source === "created");
    }

    return filtered;
  }, [groups, activeTab]);

  const totalContributed = useCountUp(Number(data?.contribution_amount ?? 0) || 0, Boolean(data), 1200);
  const totalReceived = useCountUp(Number(data?.pool_balance ?? 0) || 0, Boolean(data), 1200);

  return (
    <div className="min-h-screen bg-[#0D1F3C] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          ref={sidebarRef}
          className={`hidden w-[240px] shrink-0 border-r border-white/10 bg-[#0A1628] px-5 py-6 lg:flex lg:flex-col ${
            sidebarVisible ? "visible" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#6C3FC7] text-sm font-extrabold">
              P
            </div>
            <div>
              <p className="font-display text-lg font-extrabold">PaluwagaChain</p>
              <p className="text-xs text-white/50">Dashboard</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex w-full items-center gap-3 rounded-xl border-l-4 px-4 py-3 transition ${
                activeTab === "all"
                  ? "border-[#00C6FF] bg-white/5 text-white"
                  : "border-transparent text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
              All Groups
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("created")}
              className={`flex w-full items-center gap-3 rounded-xl border-l-4 px-4 py-3 transition ${
                activeTab === "created"
                  ? "border-[#00C6FF] bg-white/5 text-white"
                  : "border-transparent text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-base">bookmark</span>
              My Groups
            </button>
            <Link
              to="/create"
              className="flex items-center gap-3 rounded-xl border-l-4 border-transparent px-4 py-3 text-white/65 transition hover:bg-white/5 hover:text-white"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Create Group
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl border-l-4 border-transparent px-4 py-3 text-white/65 transition hover:bg-white/5 hover:text-white"
            >
              <span className="material-symbols-outlined text-base">person</span>
              Profile
            </Link>
            <button
              type="button"
              onClick={disconnect}
              className="flex w-full items-center gap-3 rounded-xl border-l-4 border-transparent px-4 py-3 text-left text-white/65 transition hover:bg-white/5 hover:text-white"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Disconnect
            </button>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Wallet Address</p>
            <p className="mono mt-2 break-all text-xs text-white/80">{publicKey || "Connect Freighter"}</p>
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 lg:px-8">
          <header className="mb-6 flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                {activeTab === "created" ? "My Groups" : "All Groups"}
              </p>
              <h1 className="font-display text-3xl font-extrabold">
                {activeTab === "created" ? "My Groups" : "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/create" className="secondary-button hidden sm:inline-flex">
                Create Group
              </Link>
              <button className="primary-button">Refresh</button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Total Contributed", `USDC ${totalContributed}`],
              ["Total Received", `USDC ${totalReceived}`],
              ["Active Groups", String(visibleGroups.length)]
            ].map(([label, value]) => (
              <article key={label} className="glass-panel rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
                <p className="text-[13px] uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-3 text-3xl font-extrabold text-[#00C6FF]">{value}</p>
              </article>
            ))}
          </div>

          <section className="mt-6 space-y-4">
            {error && (
              <div className="rounded-2xl border border-[#E74C3C]/30 bg-[#E74C3C]/10 p-4 text-sm text-white">
                Failed to load group state: {error instanceof Error ? error.message : "Unknown error"}
              </div>
            )}
            {isLoading && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Loading live group data...
              </div>
            )}
            {!isLoading && !error && visibleGroups.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                No live group data yet. Set VITE_CONTRACT_ID and connect a wallet that belongs to the group.
              </div>
            )}
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {visibleGroups.map((group, index) => (
              <div key={group.id} className={`animate-on-scroll visible stagger-${Math.min(index + 1, 5)}`}>
                <GroupCard group={group} />
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
