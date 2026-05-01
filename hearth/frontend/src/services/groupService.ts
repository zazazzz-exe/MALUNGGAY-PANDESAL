import { CreateGroupInput, GroupSummary } from "../store/groupStore";

const LOCAL_SHARED_GROUPS_KEY = "hearth-shared-hearths";
const API_BASE_URL = (import.meta.env.VITE_GROUPS_API_BASE_URL || "http://localhost:4000").trim();

interface GroupApiRecord {
  id: string;
  name: string;
  members: string[];
  contributionAmount: string;
  rotationFrequencyDays: number;
  creatorUserId: string;
  memberUserIds: string[];
  createdAt: string;
}

interface CreateSharedGroupInput extends CreateGroupInput {
  creatorUserId: string;
}

const normalizeRecord = (value: unknown): GroupApiRecord | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<GroupApiRecord>;

  if (!record.id || !record.name || !record.creatorUserId || !record.createdAt) {
    return null;
  }

  const members = Array.isArray(record.members) ? record.members.filter((member): member is string => typeof member === "string") : [];
  const memberUserIds = Array.isArray(record.memberUserIds)
    ? record.memberUserIds.filter((memberId): memberId is string => typeof memberId === "string")
    : [];

  return {
    id: record.id,
    name: record.name,
    members,
    contributionAmount: String(record.contributionAmount || "0"),
    rotationFrequencyDays: Number(record.rotationFrequencyDays || 7),
    creatorUserId: record.creatorUserId,
    memberUserIds,
    createdAt: record.createdAt
  };
};

const mapRecordToSummary = (record: GroupApiRecord): GroupSummary => {
  const nextReleaseAt = new Date(new Date(record.createdAt).getTime() + record.rotationFrequencyDays * 86400000).toISOString();

  return {
    id: record.id,
    name: record.name,
    source: "created",
    creatorUserId: record.creatorUserId,
    memberUserIds: record.memberUserIds,
    createdAt: record.createdAt,
    yourTurn: 1,
    totalMembers: record.members.length,
    currentRound: 1,
    poolBalance: "0",
    contributedMembers: 0,
    contributionAmount: record.contributionAmount,
    rotationFrequencyDays: record.rotationFrequencyDays,
    hasPaid: false,
    status: "waiting",
    memberPreview: record.members,
    nextReleaseAt
  };
};

const readLocalGroups = (): GroupApiRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_SHARED_GROUPS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeRecord)
      .filter((record): record is GroupApiRecord => record !== null);
  } catch {
    return [];
  }
};

const writeLocalGroups = (groups: GroupApiRecord[]) => {
  localStorage.setItem(LOCAL_SHARED_GROUPS_KEY, JSON.stringify(groups));
};

const fetchFromApi = async (): Promise<GroupApiRecord[]> => {
  const response = await fetch(`${API_BASE_URL}/groups`);
  if (!response.ok) {
    throw new Error("Failed to fetch groups from backend.");
  }

  const payload = (await response.json()) as unknown[];
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(normalizeRecord)
    .filter((record): record is GroupApiRecord => record !== null);
};

const postToApi = async (input: CreateSharedGroupInput): Promise<GroupApiRecord> => {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Failed to create group in backend.");
  }

  const payload = normalizeRecord(await response.json());
  if (!payload) {
    throw new Error("Backend returned an invalid group payload.");
  }

  return payload;
};

const postJoinToApi = async (groupId: string, userId: string): Promise<GroupApiRecord> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    throw new Error("Failed to join group in backend.");
  }

  const payload = normalizeRecord(await response.json());
  if (!payload) {
    throw new Error("Backend returned an invalid group payload.");
  }

  return payload;
};

export const fetchSharedGroups = async (): Promise<GroupSummary[]> => {
  let records: GroupApiRecord[] = [];

  if (API_BASE_URL) {
    try {
      records = await fetchFromApi();
    } catch {
      records = readLocalGroups();
    }
  } else {
    records = readLocalGroups();
  }

  return records.map(mapRecordToSummary);
};

export const createSharedGroup = async (input: CreateSharedGroupInput): Promise<GroupSummary> => {
  if (API_BASE_URL) {
    try {
      const created = await postToApi(input);
      return mapRecordToSummary(created);
    } catch {
      // Fall back to local persistence to keep create flow usable when backend is down.
    }
  }

  const now = new Date().toISOString();
  const localRecord: GroupApiRecord = {
    id: crypto.randomUUID(),
    name: input.name,
    members: input.members,
    contributionAmount: input.contributionAmount,
    rotationFrequencyDays: input.rotationFrequencyDays,
    creatorUserId: input.creatorUserId,
    memberUserIds: [input.creatorUserId],
    createdAt: now
  };

  const groups = readLocalGroups();
  writeLocalGroups([localRecord, ...groups.filter((group) => group.id !== localRecord.id)]);

  return mapRecordToSummary(localRecord);
};

const deleteFromApi = async (groupId: string, userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    let message = "Failed to delete Hearth.";
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // ignore body parse errors
    }
    throw new Error(message);
  }
};

export const deleteSharedGroup = async (groupId: string, userId: string): Promise<void> => {
  if (API_BASE_URL) {
    try {
      await deleteFromApi(groupId, userId);
    } catch (apiError) {
      // Fall through to local cleanup so the user can still remove a stale local entry,
      // but surface the original error if the local list also doesn't contain it.
      const groups = readLocalGroups();
      if (!groups.some((group) => group.id === groupId)) {
        throw apiError;
      }
    }
  }

  const groups = readLocalGroups();
  const filtered = groups.filter((group) => group.id !== groupId);
  if (filtered.length !== groups.length) {
    writeLocalGroups(filtered);
  }
};

export const joinSharedGroup = async (groupId: string, userId: string): Promise<GroupSummary> => {
  if (API_BASE_URL) {
    try {
      const updated = await postJoinToApi(groupId, userId);
      return mapRecordToSummary(updated);
    } catch {
      // Fall back to local persistence so join still works without backend.
    }
  }

  const groups = readLocalGroups();
  const target = groups.find((group) => group.id === groupId);

  if (!target) {
    throw new Error("Group not found.");
  }

  if (!target.memberUserIds.includes(userId)) {
    target.memberUserIds = [...target.memberUserIds, userId];
  }

  writeLocalGroups(groups);
  return mapRecordToSummary(target);
};
