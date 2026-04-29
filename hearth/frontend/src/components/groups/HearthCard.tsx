import { Link } from "react-router-dom";
import { GroupSummary } from "../../store/groupStore";
import { useUsdcPhpRate } from "../../hooks/useUsdcPhpRate";
import {
  formatPhp,
  formatUsdc,
  usdcFromStroops
} from "../../lib/format";

interface HearthCardProps {
  group: GroupSummary;
  currentUserId?: string | null;
  onJoin?: (groupId: string) => void;
  joinLoadingId?: string | null;
}

const STATUS_TOOLTIPS: Record<string, string> = {
  Kindled: "Hearth created on this device. Live status appears once it's funded on Stellar.",
  "Your warmth": "It's your turn — the next release will go to your address.",
  "Ready to send warmth": "Every Keeper has tended; the warmth can be released now.",
  "Tending in progress": "Some Keepers still need to tend before warmth can flow."
};

const HearthCard = ({
  group,
  currentUserId,
  onJoin,
  joinLoadingId
}: HearthCardProps) => {
  const phpRate = useUsdcPhpRate();
  const progress = group.totalMembers
    ? Math.min(100, ((group.contributedMembers ?? 0) / group.totalMembers) * 100)
    : Math.min(100, (group.currentRound / 10) * 100);
  const status =
    group.source === "created"
      ? "Kindled"
      : group.status === "your-turn"
        ? "Your warmth"
        : group.status === "ready"
          ? "Ready to send warmth"
          : "Tending in progress";
  const hasJoined = Boolean(
    currentUserId && group.memberUserIds?.includes(currentUserId)
  );
  const joinedCount = group.memberUserIds?.length ?? 0;
  const canJoin = Boolean(
    onJoin &&
      currentUserId &&
      group.source === "created" &&
      group.creatorUserId &&
      group.creatorUserId !== currentUserId &&
      !hasJoined
  );
  const isJoining = joinLoadingId === group.id;

  // poolBalance from the contract is i128 stroops; convert to USDC.
  const poolUsdc = usdcFromStroops(group.poolBalance);
  const poolPhp = poolUsdc * phpRate;

  return (
    <article className="rounded-[20px] border border-warmgray/70 bg-white/85 p-5 text-wood backdrop-blur-xl transition-transform hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Hearth</p>
          <h3 className="mt-2 font-display text-[24px] font-bold text-wood">{group.name}</h3>
          {group.source === "created" && (
            <p className="mt-1 text-xs text-wood-soft/70">Created on this device</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className="rounded-full bg-amber px-3 py-1 text-[11px] font-bold text-wood"
            title={STATUS_TOOLTIPS[status]}
          >
            {status}
          </span>
          {hasJoined && (
            <span className="rounded-full bg-success px-3 py-1 text-[11px] font-bold text-cream">
              Joined
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-amber-soft/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ember to-ember-deep"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-wood-soft">
          <p>Your turn: #{group.yourTurn}</p>
          <p>Season {group.currentRound}</p>
          <p
            className="col-span-2 text-ember-deep"
            title="Funds currently held by the Hearth contract."
          >
            Hearth: <span className="font-semibold">{formatUsdc(poolUsdc)}</span>{" "}
            <span className="text-wood-soft/80">≈ {formatPhp(poolPhp)}</span>
          </p>
          <p className="col-span-2">
            Next warmth:{" "}
            {new Date(group.nextReleaseAt).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric"
            })}
          </p>
        </div>

        {group.source === "created" && (
          <div className="flex items-center justify-between rounded-xl border border-warmgray/70 bg-cream/60 px-4 py-3 text-xs text-wood-soft">
            <span>Keepers joined</span>
            <span className="font-semibold text-wood">{joinedCount}</span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-warmgray/70 bg-cream/60 px-4 py-3 text-xs text-wood-soft">
          <span>This Season</span>
          <span className="font-semibold text-wood">{Math.round(progress)}% tended</span>
        </div>

        {canJoin && (
          <button
            type="button"
            onClick={() => onJoin?.(group.id)}
            disabled={isJoining}
            className="secondary-button inline-flex w-full justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isJoining ? "Joining..." : "Join the Hearth"}
          </button>
        )}

        <Link
          to={`/group/${group.id}`}
          state={{ group }}
          className="primary-button inline-flex w-full justify-center text-sm"
        >
          Open Hearth
        </Link>
      </div>
    </article>
  );
};

export default HearthCard;
