interface RotationTimelineProps {
  members: string[];
  currentIndex: number;
}

const safeAddress = (value: unknown): string => {
  if (typeof value !== "string") {
    return "Unknown";
  }

  const trimmed = value.trim();
  return trimmed || "Unknown";
};

const compactAddress = (value: unknown): string => {
  const normalized = safeAddress(value);
  if (normalized === "Unknown") {
    return normalized;
  }
  if (normalized.length <= 10) {
    return normalized;
  }
  return `${normalized.slice(0, 5)}...${normalized.slice(-4)}`;
};

const RotationTimeline = ({ members, currentIndex }: RotationTimelineProps) => {
  const normalizedMembers = Array.isArray(members) ? members.map(safeAddress) : [];

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-center gap-3">
        {normalizedMembers.map((member, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div key={`${member}-${index}`} className="flex items-center gap-3">
              <div
                className={`relative rounded-2xl border px-4 py-3 text-sm transition-all ${isCurrent ? "border-[#a855f7] bg-[#2a133f] text-white shadow-[0_0_24px_rgba(168,85,247,0.35)]" : "border-[#e9d5ff] bg-white text-slate-700 shadow-sm"}`}
              >
                {isCurrent && <span className="absolute -top-2 right-3 rounded-full bg-[#f5d0fe] px-2 py-0.5 text-[10px] font-bold text-[#2a133f]">RECEIVING NOW</span>}
                <p className="font-semibold">Turn {index + 1}</p>
                <p className="mono text-xs">{compactAddress(member)}</p>
              </div>
              {index < normalizedMembers.length - 1 && <span className="text-xl text-[#a855f7]/60">→</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RotationTimeline;
