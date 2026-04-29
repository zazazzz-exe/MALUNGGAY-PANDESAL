import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HearthCard from "../components/groups/HearthCard";
import AddressDisplay from "../components/ui/AddressDisplay";
import NotificationsBanner, {
  DashboardNotification
} from "../components/dashboard/NotificationsBanner";
import OnboardingTour, {
  TourStep
} from "../components/onboarding/OnboardingTour";
import { useFreighter } from "../hooks/useFreighter";
import { useGroupState } from "../hooks/useGroupState";
import { useInViewAnimation } from "../hooks/useInViewAnimation";
import { useNicknames } from "../hooks/useNicknames";
import { useReceivedNative } from "../hooks/useReceivedNative";
import {
  isOnboardingComplete,
  useOnboarding
} from "../hooks/useOnboarding";
import { useGroupStore, GroupSummary } from "../store/groupStore";
import { useAuthStore } from "../store/authStore";
import { fetchSharedGroups, joinSharedGroup } from "../services/groupService";
import { truncateAddress } from "../lib/format";

const TOUR_STEPS: TourStep[] = [
  {
    selector: "[data-tour='welcome']",
    title: "Welcome to Hearth",
    body:
      "Each Hearth is a circle of Keepers supporting one Kin in turn — the funds are held by a Soroban contract on Stellar, not by Hearth."
  },
  {
    selector: "[data-tour='kindle-link']",
    title: "Start a Hearth",
    body:
      "Choose who to support and how much. We'll walk you through the rest."
  },
  {
    selector: "[data-tour='stat-cards']",
    title: "Your activity",
    body:
      "These update in real time. Tended is what you've sent so far. Warmth received is what's landed in your Stellar address."
  },
  {
    selector: "[data-tour='hearth-list']",
    title: "Your Hearths",
    body:
      "Every Hearth you create or join lives here. Open one to see Keepers, the live balance, and Tending history."
  }
];

const formatXlm = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }
  if (value >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
};

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
      name: "Your Hearth",
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
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const { publicKey, disconnect } = useFreighter();
  const { data, isLoading, error } = useGroupState();
  const { groups, contributionHistory, upsertGroups } = useGroupStore();
  const { data: receivedNative = 0 } = useReceivedNative(publicKey);
  const { getNickname } = useNicknames();
  const { start: startOnboarding } = useOnboarding();

  useEffect(() => {
    if (isOnboardingComplete()) {
      return;
    }
    const timer = window.setTimeout(() => startOnboarding(), 700);
    return () => window.clearTimeout(timer);
  }, [startOnboarding]);
  const [activeTab, setActiveTab] = useState<"all" | "created">("all");
  const [sharedGroupsError, setSharedGroupsError] = useState<string | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDisconnect = () => {
    const { signOut } = useAuthStore.getState();
    disconnect();
    signOut();
    navigate("/");
  };

  const liveGroups = useMemo(() => normalizeGroupState(data, publicKey), [data, publicKey]);

  useEffect(() => {
    upsertGroups(liveGroups);
  }, [liveGroups, upsertGroups]);

  useEffect(() => {
    let cancelled = false;

    const loadSharedGroups = async () => {
      try {
        const sharedGroups = await fetchSharedGroups();
        if (!cancelled) {
          upsertGroups(sharedGroups);
          setSharedGroupsError(null);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setSharedGroupsError(fetchError instanceof Error ? fetchError.message : "Unable to fetch shared Hearths.");
        }
      }
    };

    void loadSharedGroups();

    return () => {
      cancelled = true;
    };
  }, [upsertGroups]);

  const loadSharedGroups = async () => {
    try {
      setIsRefreshing(true);
      const sharedGroups = await fetchSharedGroups();
      upsertGroups(sharedGroups);
      setSharedGroupsError(null);
    } catch (fetchError) {
      setSharedGroupsError(fetchError instanceof Error ? fetchError.message : "Unable to fetch shared Hearths.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUserId) {
      navigate("/auth?redirect=/dashboard");
      return;
    }

    try {
      setJoiningGroupId(groupId);
      const updatedGroup = await joinSharedGroup(groupId, currentUserId);
      upsertGroups([updatedGroup]);
    } catch (joinError) {
      setSharedGroupsError(joinError instanceof Error ? joinError.message : "Unable to join Hearth.");
    } finally {
      setJoiningGroupId(null);
    }
  };

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
      filtered = filtered.filter((group) => {
        if (group.source !== "created") {
          return false;
        }

        if (!currentUserId) {
          return false;
        }

        return group.creatorUserId === currentUserId || Boolean(group.memberUserIds?.includes(currentUserId));
      });
    }

    return filtered;
  }, [groups, activeTab, currentUserId]);

  const totalTendedXlm = useMemo(() => {
    if (!publicKey) {
      return 0;
    }
    return contributionHistory
      .filter((entry) => entry.memberAddress === publicKey && (entry.asset || "XLM") === "XLM")
      .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  }, [contributionHistory, publicKey]);

  const notifications = useMemo<DashboardNotification[]>(() => {
    if (!data || !publicKey) {
      return [];
    }
    const out: DashboardNotification[] = [];

    const rawMembers: unknown[] = Array.isArray(data.members)
      ? data.members
      : Array.isArray(data.Members)
        ? data.Members
        : [];
    const memberAddresses: string[] = rawMembers
      .map((m) =>
        typeof m === "string"
          ? m
          : m && typeof m === "object" && "address" in m
            ? String((m as { address?: unknown }).address || "")
            : ""
      )
      .filter(Boolean);

    if (memberAddresses.length === 0) {
      return out;
    }

    const round = Number(data.round ?? 1) || 1;
    const rotationIndex = Number(data.rotation_index ?? data.rotationIndex ?? 0) || 0;
    const paidStatus =
      (data.paid_status as Record<string, boolean> | undefined) ??
      (data.paidStatus as Record<string, boolean> | undefined) ??
      {};
    const isMember = memberAddresses.includes(publicKey);
    if (!isMember) {
      return out;
    }

    const tendedCount = memberAddresses.filter((m) => Boolean(paidStatus[m])).length;
    const allTended = tendedCount === memberAddresses.length;
    const userTended = Boolean(paidStatus[publicKey]);
    const nextRecipient = memberAddresses[rotationIndex] || memberAddresses[0];
    const nextRecipientLabel =
      getNickname(nextRecipient) ||
      (nextRecipient ? truncateAddress(nextRecipient) : "the next Kin");

    if (allTended) {
      if (nextRecipient === publicKey) {
        out.push({
          id: `your-warmth:onchain-group:round-${round}`,
          message:
            "You're next. Warmth from this Season is ready to flow to you.",
          variant: "ready"
        });
      } else {
        out.push({
          id: `ready-to-release:onchain-group:round-${round}`,
          message: `Your Hearth is ready to release warmth to ${nextRecipientLabel} this Season.`,
          variant: "ready"
        });
      }
    } else if (!userTended && tendedCount > 0) {
      out.push({
        id: `tend-needed:onchain-group:round-${round}`,
        message: `Season ${round} is underway — your tending is still pending. ${tendedCount} of ${memberAddresses.length} Keepers have tended.`,
        variant: "warning"
      });
    }

    return out;
  }, [data, publicKey, getNickname]);

  return (
    <div className="min-h-screen bg-[linear-gradient(165deg,#FAF3E7_0%,#FFFBF2_45%,#F0E5D0_100%)] text-wood">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          ref={sidebarRef}
          className={`glass-soft hidden w-[240px] shrink-0 border-r border-warmgray/70 px-5 py-6 lg:flex lg:flex-col ${
            sidebarVisible ? "visible" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <img
              src="/Hearth_LogoPure.png"
              alt="Hearth logo"
              className="h-10 w-10 rounded-xl object-cover"
            />
            <div>
              <p className="font-display text-lg font-bold">Hearth</p>
              <p className="text-xs text-wood-soft/70">Your Hearths</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex w-full items-center gap-3 rounded-xl border-l-4 px-4 py-3 transition ${
                activeTab === "all"
                  ? "border-ember bg-amber-soft/40 text-ember-deep"
                  : "border-transparent text-wood-soft hover:bg-amber-soft/30 hover:text-ember-deep"
              }`}
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
              All Hearths
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("created")}
              className={`flex w-full items-center gap-3 rounded-xl border-l-4 px-4 py-3 transition ${
                activeTab === "created"
                  ? "border-ember bg-amber-soft/40 text-ember-deep"
                  : "border-transparent text-wood-soft hover:bg-amber-soft/30 hover:text-ember-deep"
              }`}
            >
              <span className="material-symbols-outlined text-base">bookmark</span>
              My Hearths
            </button>
            <Link
              to="/create"
              data-tour="kindle-link"
              className="flex items-center gap-3 rounded-xl border-l-4 border-transparent px-4 py-3 text-wood-soft transition hover:bg-amber-soft/30 hover:text-ember-deep"
            >
              <span className="material-symbols-outlined text-base">local_fire_department</span>
              Kindle a Hearth
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl border-l-4 border-transparent px-4 py-3 text-wood-soft transition hover:bg-amber-soft/30 hover:text-ember-deep"
            >
              <span className="material-symbols-outlined text-base">person</span>
              Profile
            </Link>
            <button
              type="button"
              onClick={() => startOnboarding()}
              className="flex w-full items-center gap-3 rounded-xl border-l-4 border-transparent px-4 py-3 text-left text-wood-soft transition hover:bg-amber-soft/30 hover:text-ember-deep"
            >
              <span className="material-symbols-outlined text-base">help</span>
              Show me around
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              className="flex w-full items-center gap-3 rounded-xl border-l-4 border-transparent px-4 py-3 text-left text-wood-soft transition hover:bg-amber-soft/30 hover:text-ember-deep"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Step away
            </button>
          </nav>

          <div className="mt-auto rounded-2xl border border-warmgray/70 bg-white/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-wood-soft/70">Your Stellar address</p>
            {publicKey ? (
              <div className="mt-2">
                <AddressDisplay address={publicKey} />
                <p className="mono mt-2 break-all text-[11px] text-wood-soft/70">{publicKey}</p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-wood-soft">Connect Freighter to see your address.</p>
            )}
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 lg:px-8">
          <header
            data-tour="welcome"
            className="glass-soft mb-6 flex items-center justify-between rounded-[20px] px-5 py-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">
                {activeTab === "created" ? "My Hearths" : "All Hearths"}
              </p>
              <h1 className="font-display text-3xl font-bold">
                {activeTab === "created" ? "My Hearths" : "Your Hearths"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/create"
                data-tour="kindle-link"
                className="secondary-button hidden sm:inline-flex"
              >
                Kindle a Hearth
              </Link>
              <button
                type="button"
                onClick={() => void loadSharedGroups()}
                className="primary-button"
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </header>

          <NotificationsBanner notifications={notifications} />

          <div data-tour="stat-cards" className="grid gap-4 md:grid-cols-3">
            {[
              ["Tended", `${formatXlm(totalTendedXlm)} XLM`],
              ["Warmth received", `${formatXlm(receivedNative)} XLM`],
              ["Active Hearths", String(visibleGroups.length)]
            ].map(([label, value]) => (
              <article key={label} className="glass-soft interactive-card p-5">
                <p className="text-[13px] uppercase tracking-[0.18em] text-wood-soft/70">{label}</p>
                <p className="mt-3 font-display text-3xl font-bold text-ember">{value}</p>
              </article>
            ))}
          </div>

          <section className="mt-6 space-y-4">
            {error && (
              <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
                Couldn&rsquo;t load Hearth state: {error instanceof Error ? error.message : "Unknown error"}
              </div>
            )}
            {sharedGroupsError && (
              <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
                Shared Hearths warning: {sharedGroupsError}
              </div>
            )}
            {isLoading && (
              <div className="rounded-2xl border border-warmgray/70 bg-white/70 p-4 text-sm text-wood-soft">
                Loading Hearth state...
              </div>
            )}
            {!isLoading && !error && visibleGroups.length === 0 && (
              <div className="rounded-2xl border border-warmgray/70 bg-white/70 p-4 text-sm text-wood-soft">
                {activeTab === "all"
                  ? "No Hearths yet. Kindle one from any account, then tap Refresh."
                  : "You haven&rsquo;t kindled or joined any Hearths yet."}
              </div>
            )}
          </section>

          <section
            data-tour="hearth-list"
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            {visibleGroups.map((group, index) => (
              <div
                key={group.id}
                className={`animate-on-scroll visible stagger-${Math.min(index + 1, 5)}`}
              >
                <HearthCard
                  group={group}
                  currentUserId={currentUserId}
                  onJoin={handleJoinGroup}
                  joinLoadingId={joiningGroupId}
                />
              </div>
            ))}
          </section>
        </main>
      </div>
      <OnboardingTour steps={TOUR_STEPS} />
    </div>
  );
};

export default Dashboard;
