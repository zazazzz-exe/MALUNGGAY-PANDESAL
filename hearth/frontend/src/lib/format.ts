// Stellar Asset Contracts (including USDC) use 7 decimals.
const USDC_DECIMALS = 7;
const USDC_DIVISOR = 10 ** USDC_DECIMALS;

export const usdcFromStroops = (
  raw: string | number | bigint | null | undefined
): number => {
  if (raw === null || raw === undefined) {
    return 0;
  }
  if (typeof raw === "bigint") {
    return Number(raw) / USDC_DIVISOR;
  }
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return n / USDC_DIVISOR;
};

export const formatUsdc = (amount: number): string => {
  if (!Number.isFinite(amount) || amount === 0) {
    return "0.00 USDC";
  }
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} USDC`;
};

export const formatPhp = (amount: number): string => {
  if (!Number.isFinite(amount) || amount === 0) {
    return "₱0";
  }
  if (amount >= 1) {
    return `₱${Math.round(amount).toLocaleString()}`;
  }
  return `₱${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export const formatUsdcWithPhp = (amount: number, phpRate: number): string => {
  return `${formatUsdc(amount)} ≈ ${formatPhp(amount * phpRate)}`;
};

export const formatXlm = (amount: number): string => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0 XLM";
  }
  if (amount >= 1) {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`;
  }
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} XLM`;
};

export const truncateAddress = (
  address: string | null | undefined,
  prefix = 5,
  suffix = 4
): string => {
  if (!address) {
    return "—";
  }
  const s = String(address).trim();
  if (s.length <= prefix + suffix + 1) {
    return s;
  }
  return `${s.slice(0, prefix)}…${s.slice(-suffix)}`;
};

export const isValidStellarAddress = (value: string | null | undefined): boolean => {
  if (!value) {
    return false;
  }
  return /^[GC][A-Z2-7]{55}$/.test(value.trim());
};

export const formatTimestamp = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
};

export type NextDueTone = "neutral" | "scheduled" | "due" | "overdue";

export interface NextDueInfo {
  label: string;
  tone: NextDueTone;
  dueAt: Date;
  hasHistory: boolean;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const computeNextDue = (
  lastSendAt: string | null,
  intervalDays: number | null | undefined
): NextDueInfo | null => {
  const interval = Number(intervalDays);
  if (!Number.isFinite(interval) || interval < 1) {
    return null;
  }

  if (!lastSendAt) {
    return {
      label: "No tending yet",
      tone: "neutral",
      dueAt: new Date(),
      hasHistory: false
    };
  }

  const lastTime = new Date(lastSendAt).getTime();
  if (!Number.isFinite(lastTime)) {
    return null;
  }

  const dueAt = new Date(lastTime + interval * 86400000);
  const diffDays = Math.round(
    (startOfDay(dueAt).getTime() - startOfDay(new Date()).getTime()) / 86400000
  );

  let label: string;
  let tone: NextDueTone;

  if (diffDays > 1) {
    label = `Due in ${diffDays} days`;
    tone = "scheduled";
  } else if (diffDays === 1) {
    label = "Due tomorrow";
    tone = "scheduled";
  } else if (diffDays === 0) {
    label = "Due today";
    tone = "due";
  } else {
    const overdue = Math.abs(diffDays);
    label = `Overdue ${overdue} day${overdue === 1 ? "" : "s"}`;
    tone = "overdue";
  }

  return { label, tone, dueAt, hasHistory: true };
};

export const formatDueDate = (d: Date): string =>
  d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
