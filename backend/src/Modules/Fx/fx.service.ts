import axios from "axios";
import { logger } from "../../shared/Utils/Logger";

// Primary: open.er-api.com — free, no key, supports 160+ currencies including all African ones
// Fallback: hard-coded approximate rates used only when the API is unreachable
const ER_API_URL = "https://open.er-api.com/v6/latest/USD";

const FALLBACK_RATES: Record<string, number> = {
  KES: 129.50,
  NGN: 1610.00,
  GHS:  15.80,
  TZS: 2700.00,
  UGX: 3780.00,
  USD:    1.00,
  EUR:    0.92,
  GBP:    0.79,
};

const cache: Record<string, { rate: number; fetchedAt: number }> = {};
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Prefetch all rates in one request and populate cache
async function refreshCache(): Promise<void> {
  const { data } = await axios.get(ER_API_URL, { timeout: 8000 });
  const now = Date.now();
  const rates: Record<string, number> = data.rates ?? {};
  for (const [currency, rate] of Object.entries(rates)) {
    if (typeof rate === "number") {
      cache[currency] = { rate, fetchedAt: now };
    }
  }
}

export class FxService {
  /**
   * Returns how many units of toCurrency equal 1 USDC (≈ 1 USD).
   */
  async getRate(toCurrency: string): Promise<number> {
    const now = Date.now();
    const cached = cache[toCurrency];
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.rate;
    }

    try {
      await refreshCache();
      const fresh = cache[toCurrency];
      if (!fresh) throw new Error(`Currency not found: ${toCurrency}`);
      logger.info({ toCurrency, rate: fresh.rate }, "FX rate fetched");
      return fresh.rate;
    } catch (err: any) {
      logger.error({ toCurrency, err: err.message }, "FX fetch failed, using fallback");
      // Use stale cache if available, otherwise use hard-coded fallback
      if (cached) return cached.rate;
      const fallback = FALLBACK_RATES[toCurrency];
      if (fallback) return fallback;
      throw new Error(`Unable to fetch FX rate for ${toCurrency}`);
    }
  }

  async convert(amountUsdc: string, toCurrency: string): Promise<{ fiatAmount: string; rate: number }> {
    const rate = await this.getRate(toCurrency);
    const fiatAmount = (parseFloat(amountUsdc) * rate).toFixed(2);
    return { fiatAmount, rate };
  }
}

export const fxService = new FxService();
