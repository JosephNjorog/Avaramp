import axios from "axios";
import { logger } from "../../shared/Utils/Logger";

// USDC is pegged 1:1 to USD — fetch USD → target currency from Frankfurter (free, no key).
const FRANKFURTER_URL = "https://api.frankfurter.app/latest";

const cache: Record<string, { rate: number; fetchedAt: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
      const { data } = await axios.get(FRANKFURTER_URL, {
        params: { from: "USD", to: toCurrency },
        timeout: 5000,
      });
      const rate: number = data.rates[toCurrency];
      if (!rate) throw new Error(`No rate returned for ${toCurrency}`);
      cache[toCurrency] = { rate, fetchedAt: now };
      logger.info({ toCurrency, rate }, "FX rate fetched");
      return rate;
    } catch (err: any) {
      logger.error({ toCurrency, err: err.message }, "FX rate fetch failed");
      if (cached) return cached.rate;
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
