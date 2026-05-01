import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";
import { useNicknames } from "../hooks/useNicknames";
import { useUsdcPhpRate } from "../hooks/useUsdcPhpRate";
import { createSharedGroup } from "../services/groupService";
import ConfirmModal from "../components/ui/ConfirmModal";
import {
  formatPhp,
  formatUsdc,
  isValidStellarAddress,
  truncateAddress
} from "../lib/format";

const NICKNAMES_DATALIST_ID = "hearth-known-kins";

interface Preset {
  id: string;
  label: string;
  hint: string;
  amountUsdc: string;
  seasonDays: string;
  defaultName: string;
}

const PRESETS: Preset[] = [
  {
    id: "weekly-allowance",
    label: "Weekly allowance",
    hint: "₱2,800/wk",
    amountUsdc: "50",
    seasonDays: "7",
    defaultName: "Weekly allowance"
  },
  {
    id: "monthly-support",
    label: "Monthly support",
    hint: "₱11,200/mo",
    amountUsdc: "200",
    seasonDays: "30",
    defaultName: "Monthly support"
  },
  {
    id: "tuition-support",
    label: "Tuition support",
    hint: "₱28,000/mo",
    amountUsdc: "500",
    seasonDays: "30",
    defaultName: "Tuition support"
  }
];

// Smart defaults: weekly cadence, modest amount, gives the user something
// reasonable to tweak rather than a blank form.
const DEFAULT_AMOUNT_USDC = "50";
const DEFAULT_SEASON_DAYS = "7";

const CreateGroup = () => {
  const navigate = useNavigate();
  const [hearthName, setHearthName] = useState("");
  const [kinAddress, setKinAddress] = useState("");
  const [contribution, setContribution] = useState(DEFAULT_AMOUNT_USDC);
  const [frequency, setFrequency] = useState(DEFAULT_SEASON_DAYS);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const upsertGroups = useGroupStore((state) => state.upsertGroups);
  const { nicknames, getNickname } = useNicknames();
  const phpRate = useUsdcPhpRate();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const knownKins = useMemo(
    () =>
      Object.entries(nicknames).map(([address, nickname]) => ({
        address,
        nickname
      })),
    [nicknames]
  );

  const applyPreset = (preset: Preset) => {
    setContribution(preset.amountUsdc);
    setFrequency(preset.seasonDays);
    if (!hearthName.trim()) {
      setHearthName(preset.defaultName);
    }
    setActivePresetId(preset.id);
    setFormError(null);
  };

  const validateForm = (): string | null => {
    const trimmedName = hearthName.trim();
    const trimmedKin = kinAddress.trim();
    const seasonDays = Number(frequency);
    const tendingAmount = Number(contribution);

    if (!trimmedName) {
      return "Hearth name is required.";
    }
    if (!trimmedKin) {
      return "Add a Kin Stellar address.";
    }
    if (!isValidStellarAddress(trimmedKin)) {
      return `"${truncateAddress(trimmedKin)}" doesn't look like a valid Stellar address. They start with G and are 56 characters long.`;
    }
    if (!Number.isFinite(tendingAmount) || tendingAmount <= 0) {
      return "Tending amount must be more than 0.";
    }
    if (!Number.isFinite(seasonDays) || seasonDays < 1) {
      return "Season length must be at least 1 day.";
    }
    if (!currentUserId) {
      return "Sign in before kindling a Hearth.";
    }
    return null;
  };

  const openReview = () => {
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return;
    }
    setFormError(null);
    setReviewing(true);
  };

  const handleConfirmKindle = async () => {
    const trimmedName = hearthName.trim();
    const trimmedKin = kinAddress.trim();
    const seasonDays = Number(frequency);

    if (!currentUserId) {
      setFormError("Sign in before kindling a Hearth.");
      setReviewing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const createdGroup = await createSharedGroup({
        name: trimmedName,
        members: [trimmedKin],
        contributionAmount: contribution,
        rotationFrequencyDays: seasonDays,
        creatorUserId: currentUserId
      });

      upsertGroups([createdGroup]);
      setReviewing(false);
      navigate("/dashboard", { state: { createdGroupId: createdGroup.id } });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Couldn't kindle the Hearth right now."
      );
      setReviewing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-10 text-wood">
        <div className="glass-soft max-w-xl rounded-[28px] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">
            Sign in needed
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold">
            Sign in before kindling a Hearth
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-wood-soft">
            Make an account or sign in first, then connect Freighter to kindle the Hearth.
          </p>
          <Link
            to="/auth?redirect=/create"
            className="primary-button mt-6 inline-flex justify-center"
          >
            Go to Sign In
          </Link>
        </div>
      </section>
    );
  }

  const trimmedKinForReview = kinAddress.trim();
  const tendingNumber = Number(contribution) || 0;
  const seasonNumber = Number(frequency) || 0;
  const tendingPhp = tendingNumber * phpRate;
  const kinNicknameForReview = trimmedKinForReview ? getNickname(trimmedKinForReview) : null;

  return (
    <section className="mx-auto max-w-3xl rounded-[28px] bg-[linear-gradient(165deg,#FAF3E7_0%,#FFFBF2_45%,#F0E5D0_100%)] px-4 py-6 text-wood md:px-6">
      <h1 className="font-display text-4xl font-bold">Kindle a Hearth</h1>
      <p className="mt-2 text-sm text-wood-soft">
        Set the rules. Choose who, how much, how often.
      </p>

      <div className="mt-5 rounded-[20px] border border-warmgray/70 bg-white/60 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-wood-soft/70">
          Most common setups
        </p>
        <p className="mt-1 text-sm text-wood-soft">
          Tap one to fill the form. You can adjust anything before kindling.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-ember bg-ember text-cream shadow-ember-glow"
                    : "border-warmgray bg-cream text-wood hover:border-ember hover:text-ember-deep"
                }`}
              >
                <span className="block">{preset.label}</span>
                <span
                  className={`mt-0.5 block text-[10px] font-normal ${
                    isActive ? "text-cream/85" : "text-wood-soft"
                  }`}
                >
                  {preset.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {knownKins.length > 0 && (
        <datalist id={NICKNAMES_DATALIST_ID}>
          {knownKins.map(({ address, nickname }) => (
            <option key={address} value={address} label={nickname} />
          ))}
        </datalist>
      )}

      <form className="glass-soft mt-6 space-y-4 rounded-3xl p-6 text-wood backdrop-blur-xl">
        <label className="block text-sm font-semibold text-wood-soft">
          Hearth name
          <input
            value={hearthName}
            onChange={(e) => setHearthName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-warmgray/70 bg-white/85 px-3 py-2 text-wood outline-none focus:border-ember"
            placeholder="e.g. Family Hearth — Manila"
          />
        </label>

        <div>
          <p className="text-sm font-semibold text-wood-soft">
            Kin (Stellar address)
          </p>
          {knownKins.length > 0 && (
            <p className="mt-1 text-[11px] text-wood-soft/70">
              Tip: start typing to pick from your saved nicknames.
            </p>
          )}
          <div className="mt-2 space-y-1">
            <input
              list={knownKins.length > 0 ? NICKNAMES_DATALIST_ID : undefined}
              value={kinAddress}
              onChange={(e) => setKinAddress(e.target.value)}
              className="w-full rounded-xl border border-warmgray/70 bg-white/85 px-3 py-2 text-wood outline-none focus:border-ember"
              placeholder="G..."
              spellCheck={false}
              autoComplete="off"
            />
            {kinNicknameForReview && (
              <p className="text-[11px] text-wood-soft">
                Saved as <span className="font-semibold text-wood">{kinNicknameForReview}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-wood-soft">
            Tending amount (USDC)
            <input
              type="number"
              min="1"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="mt-1 w-full rounded-xl border border-warmgray/70 bg-white/85 px-3 py-2 text-wood outline-none focus:border-ember"
            />
            {tendingNumber > 0 && (
              <span className="mt-1 block text-[11px] text-wood-soft/80">
                ≈ {formatPhp(tendingPhp)} per Season
              </span>
            )}
          </label>

          <label className="text-sm font-semibold text-wood-soft">
            Season length (days)
            <input
              type="number"
              min="1"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="mt-1 w-full rounded-xl border border-warmgray/70 bg-white/85 px-3 py-2 text-wood outline-none focus:border-ember"
            />
          </label>
        </div>

        {formError && (
          <p className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {formError}
          </p>
        )}

        <button
          type="button"
          onClick={openReview}
          disabled={isSubmitting}
          className="primary-button rounded-full px-6 py-3 text-sm font-bold text-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          Review &amp; kindle
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-warmgray/70 bg-white/55 p-4">
        <button
          type="button"
          onClick={() => setShowHint((s) => !s)}
          className="flex w-full items-center justify-between text-left text-sm font-semibold text-wood"
          aria-expanded={showHint}
        >
          <span>What&rsquo;s right for me?</span>
          <span aria-hidden="true" className="text-ember">
            {showHint ? "−" : "+"}
          </span>
        </button>
        {showHint && (
          <p className="mt-3 text-sm leading-relaxed text-wood-soft">
            Start small. You can always end this Hearth and kindle a new one
            with different settings. Funds you don&rsquo;t release stay yours.
          </p>
        )}
      </div>

      <ConfirmModal
        open={reviewing}
        title={`Kindle "${hearthName.trim()}"?`}
        body={
          <>
            Take a look before you light the fire. You can always kindle another Hearth later.
          </>
        }
        specifics={
          <dl className="space-y-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-wood-soft/70">
                Tending amount
              </dt>
              <dd className="mt-0.5 font-display text-lg font-semibold text-wood">
                {formatUsdc(tendingNumber)}{" "}
                <span className="text-sm font-normal text-wood-soft/85">
                  ≈ {formatPhp(tendingPhp)}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-wood-soft/70">
                Season length
              </dt>
              <dd className="mt-0.5 text-sm text-wood">
                Every {seasonNumber} day{seasonNumber === 1 ? "" : "s"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-wood-soft/70">
                Kin
              </dt>
              <dd className="mt-1 text-sm text-wood">
                {trimmedKinForReview && (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg bg-cream/60 px-2 py-1">
                    {kinNicknameForReview && (
                      <span className="font-semibold text-wood">{kinNicknameForReview}</span>
                    )}
                    <span className="mono text-[11px] text-wood-soft/80">
                      {truncateAddress(trimmedKinForReview, 6, 6)}
                    </span>
                  </div>
                )}
              </dd>
            </div>
          </dl>
        }
        feeText="Network fee paid only when this Hearth is funded on Stellar (estimated less than ₱1)."
        cancelLabel="Go back"
        confirmLabel={isSubmitting ? "Kindling..." : "Kindle Hearth"}
        isSubmitting={isSubmitting}
        onCancel={() => {
          if (!isSubmitting) {
            setReviewing(false);
          }
        }}
        onConfirm={handleConfirmKindle}
      />
    </section>
  );
};

export default CreateGroup;
