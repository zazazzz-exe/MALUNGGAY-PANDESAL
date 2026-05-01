import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HearthCard from "../components/groups/HearthCard";
import AddressDisplay from "../components/ui/AddressDisplay";
import OnboardingTour, {
  TourStep
} from "../components/onboarding/OnboardingTour";
import { useFreighter } from "../hooks/useFreighter";
import { useInViewAnimation } from "../hooks/useInViewAnimation";
import { useReceivedNative } from "../hooks/useReceivedNative";
import {
  isOnboardingComplete,
  useOnboarding
} from "../hooks/useOnboarding";
import { useGroupStore } from "../store/groupStore";
import { useAuthStore } from "../store/authStore";
import { fetchSharedGroups } from "../services/groupService";

const TOUR_STEPS: TourStep[] = [
  {
    selector: "[data-tour='welcome']",
    title: "Welcome to Hearth",
    body:
      "Each Hearth is a saved Kin you can send XLM to from your Stellar wallet — fast, on your schedule."
  },
  {
    selector: "[data-tour='kindle-link']",
    title: "Start a Hearth",
    body:
      "Save the Kin's wallet, set how much and how often. We'll walk you through the rest."
  },
  {
    selector: "[data-tour='stat-cards']",
    title: "Your activity",
    body:
      "Tended is what you've sent so far. Warmth received is what's landed in your Stellar address."
  },
  {
    selector: "[data-tour='hearth-list']",
    title: "Your Hearths",
    body:
      "Every Kin you've saved lives here. Open one to send XLM and view its history."
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

const Dashboard = () => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sidebarVisible = useInViewAnimation(sidebarRef);
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const { publicKey, disconnect, connect, isInstalled, isLoading: isWalletConnecting, error: walletError } = useFreighter();
  const { groups, contributionHistory, upsertGroups } = useGroupStore();
  const { data: receivedNative = 0 } = useReceivedNative(publicKey);
  const { start: startOnboarding } = useOnboarding();

  useEffect(() => {
    if (isOnboardingComplete()) {
      return;
    }
    const timer = window.setTimeout(() => startOnboarding(), 700);
    return () => window.clearTimeout(timer);
  }, [startOnboarding]);

  const [sharedGroupsError, setSharedGroupsError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDisconnect = () => {
    const { signOut } = useAuthStore.getState();
    disconnect();
    signOut();
    navigate("/");
  };

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
          setSharedGroupsError(fetchError instanceof Error ? fetchError.message : "Unable to fetch saved Hearths.");
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
      setSharedGroupsError(fetchError instanceof Error ? fetchError.message : "Unable to fetch saved Hearths.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const visibleGroups = useMemo(() => {
    return [...groups]
      .filter((group) => {
        if (!currentUserId) {
          return group.source === "created";
        }
        return group.creatorUserId === currentUserId;
      })
      .sort((left, right) => (right.createdAt || "").localeCompare(left.createdAt || ""));
  }, [groups, currentUserId]);

  const totalTendedXlm = useMemo(() => {
    if (!publicKey) {
      return 0;
    }
    return contributionHistory
      .filter((entry) => entry.memberAddress === publicKey && (entry.asset || "XLM") === "XLM")
      .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  }, [contributionHistory, publicKey]);

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
              <div className="mt-2 space-y-3">
                <AddressDisplay address={publicKey} />
                <p className="mono break-all text-[11px] text-wood-soft/70">{publicKey}</p>
                <button
                  type="button"
                  onClick={disconnect}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-warmgray bg-white/60 px-3 py-2 text-xs font-semibold text-wood-soft transition hover:border-error hover:text-error"
                >
                  <span className="material-symbols-outlined text-base">link_off</span>
                  Disconnect wallet
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                <p className="text-xs text-wood-soft">Connect Freighter to see your address.</p>
                {isInstalled ? (
                  <button
                    type="button"
                    onClick={() => void connect()}
                    disabled={isWalletConnecting}
                    className="primary-button inline-flex w-full items-center justify-center gap-2 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                    {isWalletConnecting ? "Connecting..." : "Connect Freighter"}
                  </button>
                ) : (
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ember px-3 py-2 text-xs font-semibold text-ember hover:bg-amber-soft/40"
                  >
                    <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                    Install Freighter
                  </a>
                )}
                {walletError && <p className="text-[11px] text-error">{walletError}</p>}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 lg:px-8">
          <header
            data-tour="welcome"
            className="glass-soft mb-6 flex items-center justify-between rounded-[20px] px-5 py-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Your Hearths</p>
              <h1 className="font-display text-3xl font-bold">Your Hearths</h1>
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
            {sharedGroupsError && (
              <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
                Saved Hearths warning: {sharedGroupsError}
              </div>
            )}
            {visibleGroups.length === 0 && (
              <div className="rounded-2xl border border-warmgray/70 bg-white/70 p-4 text-sm text-wood-soft">
                No Hearths yet. Kindle one and your saved Kins will appear here.
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
                <HearthCard group={group} />
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
