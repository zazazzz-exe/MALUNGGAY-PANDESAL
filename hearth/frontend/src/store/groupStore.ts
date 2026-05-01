import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GroupSummary {
  id: string;
  name: string;
  source?: "live" | "created";
  contractId?: string;
  creatorUserId?: string;
  memberUserIds?: string[];
  createdAt?: string;
  yourTurn: number;
  totalMembers?: number;
  currentRound: number;
  totalRounds?: number;
  poolBalance: string;
  contributedMembers?: number;
  contributionAmount?: string;
  rotationFrequencyDays?: number;
  hasPaid?: boolean;
  status?: "waiting" | "ready" | "your-turn";
  memberPreview?: string[];
  nextReleaseAt: string;
}

export interface ContributionHistoryEntry {
  id: string;
  groupId: string;
  groupName: string;
  amount: string;
  asset?: string;
  hash: string;
  memberAddress: string;
  createdAt: string;
  status: "success";
}

export interface CreateGroupInput {
  name: string;
  members: string[];
  contributionAmount: string;
  rotationFrequencyDays: number;
  creatorUserId?: string;
}

interface GroupStoreState {
  groups: GroupSummary[];
  contributionHistory: ContributionHistoryEntry[];
  upsertGroups: (groups: GroupSummary[]) => void;
  addCreatedGroup: (group: CreateGroupInput) => string;
  removeGroup: (groupId: string) => void;
  recordContribution: (entry: Omit<ContributionHistoryEntry, "id" | "createdAt" | "status">) => void;
}

export const useGroupStore = create<GroupStoreState>()(
  persist(
    (set, get) => ({
      groups: [],
      contributionHistory: [],
      upsertGroups: (groups: GroupSummary[]) =>
        set((state) => {
          const merged = new Map(state.groups.map((group) => [group.id, group]));

          groups.forEach((group) => {
            const existing = merged.get(group.id);
            merged.set(group.id, existing ? { ...existing, ...group } : group);
          });

          return { groups: Array.from(merged.values()) };
        }),
      addCreatedGroup: ({ name, members, contributionAmount, rotationFrequencyDays, creatorUserId }) => {
        const groupId = `local-${crypto.randomUUID()}`;
        const now = new Date();
        const nextReleaseAt = new Date(now.getTime() + rotationFrequencyDays * 86400000).toISOString();

        const createdGroup: GroupSummary = {
          id: groupId,
          name,
          source: "created",
          creatorUserId,
          memberUserIds: creatorUserId ? [creatorUserId] : [],
          createdAt: now.toISOString(),
          yourTurn: 1,
          totalMembers: members.length,
          currentRound: 1,
          totalRounds: undefined,
          poolBalance: "0",
          contributedMembers: 0,
          contributionAmount,
          rotationFrequencyDays,
          hasPaid: false,
          status: "waiting",
          memberPreview: members,
          nextReleaseAt
        };

        set((state) => ({
          groups: [createdGroup, ...state.groups.filter((group) => group.id !== groupId)]
        }));

        return groupId;
      },
      removeGroup: (groupId: string) =>
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== groupId),
          contributionHistory: state.contributionHistory.filter((entry) => entry.groupId !== groupId)
        })),
      recordContribution: (entry) => {
        set((state) => ({
          contributionHistory: [
            {
              ...entry,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              status: "success"
            },
            ...state.contributionHistory
          ]
        }));
      }
    }),
    {
      name: "hearth-hearth-state",
      version: 1,
      migrate: (persistedState: unknown) => {
        const state = (persistedState || {}) as Partial<GroupStoreState>;
        const groups = Array.isArray(state.groups) ? state.groups : [];
        const normalizedGroups = groups.map((group) => ({
          ...group,
          memberUserIds: Array.isArray(group.memberUserIds) ? group.memberUserIds : []
        }));
        const contributionHistory = Array.isArray(state.contributionHistory)
          ? state.contributionHistory
          : [];

        return {
          ...state,
          groups: normalizedGroups,
          contributionHistory
        };
      }
    }
  )
);
