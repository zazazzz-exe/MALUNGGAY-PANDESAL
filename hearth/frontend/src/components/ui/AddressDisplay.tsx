import { useState } from "react";
import {
  hasSeenNicknameHint,
  markNicknameHintSeen,
  useNicknames
} from "../../hooks/useNicknames";
import { truncateAddress } from "../../lib/format";

interface AddressDisplayProps {
  address: string | null | undefined;
  showEditAction?: boolean;
  className?: string;
  emphasis?: "default" | "muted";
  size?: "xs" | "sm";
}

const AddressDisplay = ({
  address,
  showEditAction = true,
  className = "",
  emphasis = "default",
  size = "sm"
}: AddressDisplayProps) => {
  const { getNickname, setNickname } = useNicknames();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [showHint, setShowHint] = useState(false);

  const nickname = getNickname(address);

  if (!address) {
    return <span className={className}>—</span>;
  }

  const startEditing = () => {
    setDraft(nickname || "");
    setEditing(true);
    if (!hasSeenNicknameHint()) {
      setShowHint(true);
      markNicknameHintSeen();
    }
  };

  const handleSave = () => {
    setNickname(address, draft);
    setEditing(false);
    setShowHint(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft("");
    setShowHint(false);
  };

  const monoSize = size === "xs" ? "text-[11px]" : "text-xs";
  const addressClass =
    emphasis === "muted" ? "text-wood-soft/60" : "text-wood-soft";

  if (editing) {
    return (
      <span className={`inline-flex flex-col gap-1 ${className}`}>
        <span className="inline-flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSave();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                handleCancel();
              }
            }}
            onBlur={handleSave}
            placeholder="e.g. Mom"
            maxLength={40}
            className="rounded-md border border-warmgray bg-white/90 px-2 py-1 text-xs text-wood placeholder:text-wood-soft/55 outline-none focus:border-ember"
          />
          <span className={`mono ${monoSize} ${addressClass}`}>
            ({truncateAddress(address)})
          </span>
        </span>
        {showHint && (
          <span className="text-[10px] text-wood-soft/70">
            Saved on this device only.
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {nickname ? (
        <>
          <span className="font-semibold text-wood">{nickname}</span>
          <span className={`mono ${monoSize} ${addressClass}`}>
            ({truncateAddress(address)})
          </span>
        </>
      ) : (
        <span className={`mono ${monoSize} ${addressClass}`}>
          {truncateAddress(address)}
        </span>
      )}
      {showEditAction && (
        <button
          type="button"
          onClick={startEditing}
          className="ml-0.5 inline-flex items-center gap-0.5 text-[11px] text-ember hover:text-ember-deep"
          aria-label={nickname ? "Edit nickname" : "Add nickname"}
          title={nickname ? "Edit nickname" : "Add a nickname"}
        >
          <span aria-hidden="true">✏</span>
          <span>{nickname ? "Edit" : "Nickname"}</span>
        </button>
      )}
    </span>
  );
};

export default AddressDisplay;
