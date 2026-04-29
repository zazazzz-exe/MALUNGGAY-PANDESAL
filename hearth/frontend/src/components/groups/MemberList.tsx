import AddressDisplay from "../ui/AddressDisplay";

interface MemberItem {
  address: string;
  hasPaid: boolean;
  turn: number;
}

interface MemberListProps {
  members: MemberItem[];
}

const MemberList = ({ members }: MemberListProps) => {
  if (!members.length) {
    return (
      <div className="rounded-2xl border border-warmgray/70 bg-white/85 p-6 text-sm text-wood-soft">
        No Keepers in this Hearth yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-warmgray/70 bg-white/90 shadow-card">
      <table className="min-w-full text-left text-sm text-wood">
        <thead className="bg-gradient-to-r from-amber-soft/50 to-cream-deep text-wood">
          <tr>
            <th className="px-4 py-3">Keeper</th>
            <th className="px-4 py-3">Turn</th>
            <th className="px-4 py-3">Tended</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr
              key={`${member.address || "member"}-${index}`}
              className="border-t border-warmgray/50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-r from-ember to-ember-deep" />
                  <AddressDisplay address={member.address} />
                </div>
              </td>
              <td className="px-4 py-3">{member.turn}</td>
              <td className="px-4 py-3">
                {member.hasPaid ? (
                  <span
                    className="inline-flex items-center gap-2 font-semibold text-success"
                    title="This Keeper has tended for the current Season."
                  >
                    ✓ Tended
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-2 font-semibold text-error"
                    title="This Keeper hasn’t tended for the current Season yet."
                  >
                    ✗ Pending
                  </span>
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
