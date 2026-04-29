import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "data", "groups.json");

const app = express();
app.use(cors());
app.use(express.json());

const readGroups = () => {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGroups = (groups) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(groups, null, 2), "utf8");
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/groups", (_req, res) => {
  res.json(readGroups());
});

app.post("/groups", (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const creatorUserId = typeof body.creatorUserId === "string" ? body.creatorUserId.trim() : "";
  const members = normalizeStringArray(body.members);
  const contributionAmount = String(body.contributionAmount || "0").trim();
  const rotationFrequencyDays = Number(body.rotationFrequencyDays || 7);

  if (!name) {
    return res.status(400).json({ message: "Group name is required." });
  }

  if (!creatorUserId) {
    return res.status(400).json({ message: "creatorUserId is required." });
  }

  if (!Number.isFinite(rotationFrequencyDays) || rotationFrequencyDays < 1) {
    return res.status(400).json({ message: "rotationFrequencyDays must be at least 1." });
  }

  const groups = readGroups();
  const created = {
    id: crypto.randomUUID(),
    name,
    members,
    contributionAmount,
    rotationFrequencyDays,
    creatorUserId,
    memberUserIds: [creatorUserId],
    createdAt: new Date().toISOString()
  };

  groups.unshift(created);
  writeGroups(groups);

  return res.status(201).json(created);
});

app.post("/groups/:id/join", (req, res) => {
  const groupId = req.params.id;
  const userId = typeof req.body?.userId === "string" ? req.body.userId.trim() : "";

  if (!userId) {
    return res.status(400).json({ message: "userId is required." });
  }

  const groups = readGroups();
  const target = groups.find((group) => group.id === groupId);

  if (!target) {
    return res.status(404).json({ message: "Group not found." });
  }

  const currentMemberIds = normalizeStringArray(target.memberUserIds);
  if (!currentMemberIds.includes(userId)) {
    currentMemberIds.push(userId);
  }

  target.memberUserIds = currentMemberIds;
  writeGroups(groups);

  return res.json(target);
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`Hearth backend running on http://localhost:${PORT}`);
});
