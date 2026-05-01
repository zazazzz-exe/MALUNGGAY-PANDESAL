import { useState } from "react";
import { Link } from "react-router-dom";
import { GroupSummary, useGroupStore } from "../../store/groupStore";
import { useAuthStore } from "../../store/authStore";
import { deleteSharedGroup } from "../../services/groupService";
import AddressDisplay from "../ui/AddressDisplay";
import ConfirmModal from "../ui/ConfirmModal";
import { useUsdcPhpRate } from "../../hooks/useUsdcPhpRate";
import {
  computeNextDue,
  formatDueDate,
  formatPhp,
  formatUsdc,
  NextDueTone,
  truncateAddress
} from "../../lib/format";

interface HearthCardProps {
  group: GroupSummary;
}

const TONE_CLASSES: Record<NextDueTone, string> = {
  neutral: "border-warmgray/70 bg-cream/60 text-wood-soft",
  scheduled: "border-warmgray/70 bg-amber-soft/30 text-wood",
  due: "border-ember/40 bg-ember/10 text-ember-deep",
  overdue: "border-error/40 bg-error/10 text-error"
};

const HearthCard = ({ group }: HearthCardProps) => {
  const phpRate = useUsdcPhpRate();
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const removeGroup = useGroupStore((state) => state.removeGroup);
  const lastSendAt = useGroupStore((state) => {
    const entries = state.contributionHistory.filter((entry) => entry.groupId === group.id);
    if (!entries.length) return null;
    return entries.reduce((latest, entry) =>
      entry.createdAt.localeCompare(latest) > 0 ? entry.createdAt : latest,
      entries[0].createdAt
    );
  });

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const kinAddress = group.memberPreview?.[0] || "";
  const tendingNumber = Number(group.contributionAmount) || 0;
  const tendingPhp = tendingNumber * phpRate;
  const seasonDays = Number(group.rotationFrequencyDays) || 0;
  const status = group.source === "created" ? "Draft" : "Saved";
  const nextDue = computeNextDue(lastSendAt, seasonDays);
  const canDelete = Boolean(currentUserId) && group.creatorUserId === currentUserId;

  const handleConfirmDelete = async () => {
    if (!currentUserId) {
      return;
    }
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteSharedGroup(group.id, currentUserId);
      removeGroup(group.id);
      setConfirmingDelete(false);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Couldn't delete this Hearth.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="rounded-[20px] border border-warmgray/70 bg-white/85 p-5 text-wood backdrop-blur-xl transition-transform hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">Hearth</p>
          <h3 className="mt-2 font-display text-[24px] font-bold text-wood">{group.name}</h3>
          {group.source === "created" && (
            <p className="mt-1 text-xs text-wood-soft/70">Saved on this device</p>
          )}
        </div>
        <span className="rounded-full bg-amber px-3 py-1 text-[11px] font-bold text-wood">
          {status}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-xl border border-warmgray/70 bg-cream/60 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-wood-soft/70">Kin</p>
          <div className="mt-1">
            {kinAddress ? (
              <AddressDisplay address={kinAddress} />
            ) : (
              <p className="text-sm text-wood-soft">No Kin set</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-wood-soft">
          <p>
            Tending:{" "}
            <span className="font-semibold text-wood">{formatUsdc(tendingNumber)}</span>{" "}
            <span className="text-wood-soft/80">≈ {formatPhp(tendingPhp)}</span>
          </p>
          <p>
            Every <span className="font-semibold text-wood">{seasonDays}</span>{" "}
            day{seasonDays === 1 ? "" : "s"}
          </p>
        </div>

        {nextDue && (
          <div
            className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs ${TONE_CLASSES[nextDue.tone]}`}
          >
            <span className="uppercase tracking-[0.14em] opacity-80">Next warmth</span>
            <span className="text-right">
              <span className="font-semibold">{nextDue.label}</span>
              {nextDue.hasHistory && (
                <span className="ml-2 opacity-75">({formatDueDate(nextDue.dueAt)})</span>
              )}
            </span>
          </div>
        )}

        <Link
          to={`/group/${group.id}`}
          state={{ group }}
          className="primary-button inline-flex w-full justify-center text-sm"
        >
          Open Hearth
        </Link>

        {canDelete && (
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmingDelete(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-warmgray bg-white/60 px-3 py-2 text-xs font-semibold text-wood-soft transition hover:border-error hover:text-error"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Delete Hearth
          </button>
        )}
        {deleteError && !confirmingDelete && (
          <p className="text-[11px] text-error">{deleteError}</p>
        )}
      </div>

      <ConfirmModal
        open={confirmingDelete}
        variant="danger"
        title={`Delete "${group.name}"?`}
        body={
          <>
            This removes the saved Kin and its tending history from this device. It can&rsquo;t be undone.
          </>
        }
        specifics={
          <dl className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-wood-soft/70">Kin</dt>
              <dd className="mono text-[11px] text-wood-soft/80">
                {kinAddress ? truncateAddress(kinAddress, 6, 6) : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-xs uppercase tracking-[0.14em] text-wood-soft/70">Cadence</dt>
              <dd className="text-sm text-wood">
                Every {seasonDays} day{seasonDays === 1 ? "" : "s"}
              </dd>
            </div>
          </dl>
        }
        feeText={deleteError || undefined}
        cancelLabel="Keep it"
        confirmLabel={isDeleting ? "Deleting..." : "Delete Hearth"}
        isSubmitting={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setConfirmingDelete(false);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </article>
  );
};

export default HearthCard;
