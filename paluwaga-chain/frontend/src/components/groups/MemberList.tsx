interface MemberItem {
  address: string;
  hasPaid: boolean;
  turn: number;
}

interface MemberListProps {
  members: MemberItem[];
}

const shortAddress = (value: unknown): string => {
  if (typeof value !== "string") {
    return "Unknown member";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "Unknown member";
  }

  if (trimmed.length <= 14) {
    return trimmed;
  }

  return `${trimmed.slice(0, 8)}...${trimmed.slice(-6)}`;
};

const MemberList = ({ members }: MemberListProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A1628]">
      <table className="min-w-full text-left text-sm text-white">
        <thead className="bg-white/5 text-white/70">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Turn</th>
            <th className="px-4 py-3">Paid Status</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={`${member.address || "member"}-${index}`} className="border-t border-white/10">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#6C3FC7]" />
                  <span className="mono text-xs">{shortAddress(member.address)}</span>
                </div>
              </td>
              <td className="px-4 py-3">{member.turn}</td>
              <td className="px-4 py-3">
                {member.hasPaid ? (
                  <span className="inline-flex items-center gap-2 font-semibold text-[#27AE60]">✓ Paid</span>
                ) : (
                  <span className="inline-flex items-center gap-2 font-semibold text-[#E74C3C]">✗ Not yet</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberList;
