import { useQuery } from "@tanstack/react-query";

const CACHE_KEY = "hearth_usdc_php_rate";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
// Sane fallback used only when both the network fetch and the cache fail.
const FALLBACK_RATE = 56;

interface CachedRate {
  rate: number;
  fetchedAt: number;
}

const readCache = (): CachedRate | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CachedRate>;
    if (
      parsed &&
      typeof parsed.rate === "number" &&
      Number.isFinite(parsed.rate) &&
      parsed.rate > 0 &&
      typeof parsed.fetchedAt === "number"
    ) {
      return { rate: parsed.rate, fetchedAt: parsed.fetchedAt };
    }
    return null;
  } catch {
    return null;
  }
};

const writeCache = (rate: number) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: CachedRate = { rate, fetchedAt: Date.now() };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
};

const fetchRate = async (): Promise<number> => {
  const cached = readCache();
  const fresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;
  if (fresh && cached) {
    return cached.rate;
  }

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=php"
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as { "usd-coin"?: { php?: number } };
    const rate = data?.["usd-coin"]?.php;
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
      throw new Error("Invalid rate payload");
    }
    writeCache(rate);
    return rate;
  } catch (e) {
    console.warn(
      "[Hearth] USDC→PHP fetch failed; using cached rate or fallback.",
      e
    );
    if (cached) {
      return cached.rate;
    }
    return FALLBACK_RATE;
  }
};

export const useUsdcPhpRate = (): number => {
  const query = useQuery({
    queryKey: ["usdc-php-rate"],
    queryFn: fetchRate,
    staleTime: CACHE_TTL_MS,
    refetchInterval: CACHE_TTL_MS,
    retry: 1
  });
  return query.data ?? readCache()?.rate ?? FALLBACK_RATE;
};
