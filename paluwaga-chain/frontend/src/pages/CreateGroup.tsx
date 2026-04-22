import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGroupStore } from "../store/groupStore";
import { createSharedGroup } from "../services/groupService";

const CreateGroup = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<string[]>([""]);
  const [contribution, setContribution] = useState("10");
  const [frequency, setFrequency] = useState("7");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUserId = useAuthStore((state) => state.currentUserId);
  const upsertGroups = useGroupStore((state) => state.upsertGroups);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGroup = async () => {
    const trimmedName = groupName.trim();
    const validMembers = members.map((member) => member.trim()).filter(Boolean);
    const rotationDays = Number(frequency);

    if (!trimmedName) {
      setFormError("Group name is required.");
      return;
    }

    if (validMembers.length < 2) {
      setFormError("Add at least two members.");
      return;
    }

    if (!Number.isFinite(rotationDays) || rotationDays < 1) {
      setFormError("Rotation frequency must be at least 1 day.");
      return;
    }

    if (!currentUserId) {
      setFormError("You must sign in before creating a group.");
      return;
    }

    setFormError(null);

    try {
      setIsSubmitting(true);
      const createdGroup = await createSharedGroup({
        name: trimmedName,
        members: validMembers,
        contributionAmount: contribution,
        rotationFrequencyDays: rotationDays,
        creatorUserId: currentUserId
      });

      upsertGroups([createdGroup]);
      navigate("/dashboard", { state: { createdGroupId: createdGroup.id } });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create group right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-10 text-slate-900">
        <div className="glass-soft max-w-xl rounded-[28px] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Authentication required</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold">Sign in before creating a group</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            You need to create an account or sign in first, then connect your Freighter wallet to deploy a pool.
          </p>
          <Link to="/auth?redirect=/create" className="primary-button mt-6 inline-flex justify-center">
            Go to Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[28px] bg-[linear-gradient(165deg,#f3e8ff_0%,#f8f5ff_45%,#ede9fe_100%)] px-4 py-6 text-slate-900 md:px-6">
      <h1 className="font-display text-4xl font-extrabold">Create Group</h1>
      <p className="mt-2 text-sm text-slate-600">Set your savings rules before deploying on-chain.</p>

      <form className="glass-soft mt-6 space-y-4 rounded-3xl p-6 text-slate-800 backdrop-blur-xl">
        <label className="block text-sm font-semibold text-slate-700">
          Group Name
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-purple-100 bg-white/80 px-3 py-2 text-slate-800 outline-none"
            placeholder="e.g. Team Paluwaga Manila"
          />
        </label>

        <div>
          <p className="text-sm font-semibold text-slate-700">Members (wallet addresses)</p>
          <div className="mt-2 space-y-2">
            {members.map((member, index) => (
              <input
                key={`${index}-${member}`}
                value={member}
                onChange={(e) => {
                  const next = [...members];
                  next[index] = e.target.value;
                  setMembers(next);
                }}
                className="w-full rounded-xl border border-purple-100 bg-white/80 px-3 py-2 text-slate-800 outline-none"
                placeholder="G..."
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMembers((prev) => [...prev, ""])}
            className="mt-2 rounded-full border border-[#00C6FF] px-3 py-1 text-xs font-semibold text-[#00C6FF]"
          >
            Add Member
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Contribution (USDC)
            <input
              type="number"
              min="1"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="mt-1 w-full rounded-xl border border-purple-100 bg-white/80 px-3 py-2 text-slate-800 outline-none"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Rotation Frequency (days)
            <input
              type="number"
              min="1"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="mt-1 w-full rounded-xl border border-purple-100 bg-white/80 px-3 py-2 text-slate-800 outline-none"
            />
          </label>
        </div>

        {formError && <p className="rounded-2xl border border-[#E74C3C]/30 bg-[#E74C3C]/10 px-4 py-3 text-sm text-[#7f1d1d]">{formError}</p>}

        <button
          type="button"
          onClick={() => void handleCreateGroup()}
          disabled={isSubmitting}
          className="primary-button rounded-full px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating Group..." : "Deploy Group Contract"}
        </button>
      </form>
    </section>
  );
};

export default CreateGroup;
