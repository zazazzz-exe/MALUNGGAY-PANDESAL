import { Link } from "react-router-dom";
import { GroupSummary } from "../../store/groupStore";

interface GroupCardProps {
  group: GroupSummary;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const progress = group.totalMembers ? Math.min(100, ((group.contributedMembers ?? 0) / group.totalMembers) * 100) : Math.min(100, (group.currentRound / 10) * 100);
  const status = group.source === "created" ? "Created" : group.status === "your-turn" ? "Your turn" : group.status === "ready" ? "Ready" : "Waiting for contributions";

  return (
    <article className="rounded-[20px] border border-white/10 bg-white/5 p-5 text-white backdrop-blur-xl transition-transform hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/45">Group</p>
          <h3 className="mt-2 font-display text-[24px] font-extrabold text-white">{group.name}</h3>
          {group.source === "created" && <p className="mt-1 text-xs text-white/50">Real-time created group</p>}
        </div>
        <span className="rounded-full bg-[#F5A623] px-3 py-1 text-[11px] font-bold text-[#3F2200]">{status}</span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-[#00C6FF] to-[#6C3FC7]" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-white/75">
          <p>Your turn: #{group.yourTurn}</p>
          <p>Round {group.currentRound}</p>
          <p className="text-[#00C6FF]">Pool: {group.poolBalance} USDC</p>
          <p>Release: {new Date(group.nextReleaseAt).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-xs text-white/60">
          <span>Progress</span>
          <span>{Math.round(progress)}% complete</span>
        </div>

        <Link to={`/group/${group.id}`} state={{ group }} className="primary-button inline-flex w-full justify-center text-sm">
          View Group
        </Link>
      </div>
    </article>
  );
};

export default GroupCard;
