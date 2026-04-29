import { useNicknames } from "../../hooks/useNicknames";
import { truncateAddress } from "../../lib/format";

interface RotationTimelineProps {
  members: string[];
  currentIndex: number;
}

const safeAddress = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const RotationTimeline = ({ members, currentIndex }: RotationTimelineProps) => {
  const { getNickname } = useNicknames();
  const normalizedMembers = Array.isArray(members) ? members.map(safeAddress) : [];

  return (
    <div className="overflow-x-auto py-2">
      <div className="flex min-w-max items-center gap-3 px-1">
        {normalizedMembers.map((member, index) => {
          const isCurrent = index === currentIndex;
          const nickname = getNickname(member);
          const label = nickname || (member ? truncateAddress(member) : "Unknown");
          return (
            <div key={`${member}-${index}`} className="flex items-center gap-3">
              <div
                className={`rounded-2xl border px-4 py-3 text-sm transition-all ${
                  isCurrent
                    ? "border-ember bg-wood text-cream shadow-[0_0_24px_rgba(232,116,60,0.40)]"
                    : "border-warmgray/70 bg-white text-wood-soft shadow-sm"
                }`}
                title={member || undefined}
              >
                {isCurrent && (
                  <span className="mb-2 inline-flex rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-wood">
                    RECEIVING WARMTH
                  </span>
                )}
                <p className="font-semibold">Turn {index + 1}</p>
                <p className={`text-xs ${nickname ? "" : "mono"}`}>{label}</p>
              </div>
              {index < normalizedMembers.length - 1 && (
                <span className="text-xl text-ember/60">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RotationTimeline;
