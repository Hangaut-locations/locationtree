// Currency conversion for display. Prices are stored in USD.
// Supports: NGN (Nigerian Naira), USD, EUR, GBP.
//
// Live rates come from open.er-api.com (free, updates once a day). They are
// cached in localStorage and the fixed rates below are only used until the
// first fetch works.

import { loadState, saveState } from "./storage"

export type CurrencyCode = "USD" | "EUR" | "GBP" | "NGN"

export const CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
]

// Rates relative to 1 USD.
export type Rates = Record<CurrencyCode, number>

export const FALLBACK_RATES: Rates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1600,
}

const RATES_URL = "https://open.er-api.com/v6/latest/USD"
const RATES_KEY = "currency_rates"
const RATES_MAX_AGE = 6 * 60 * 60 * 1000

type CachedRates = { rates: Rates; fetchedAt: number }

const cached = loadState<CachedRates | null>(RATES_KEY, null)
let rates: Rates = cached?.rates ?? FALLBACK_RATES

const pickRates = (all: Record<string, unknown>): Rates | null => {
  const picked = {} as Rates
  for (const { code } of CURRENCIES) {
    const rate = Number(all[code])
    if (!Number.isFinite(rate) || rate <= 0) return null
    picked[code] = rate
  }
  return picked
}

/** Fetches today's rates unless the cached ones are still fresh. Resolves true when rates changed. */
export async function refreshRates(): Promise<boolean> {
  if (cached && Date.now() - cached.fetchedAt < RATES_MAX_AGE) return false
  try {
    const response = await fetch(RATES_URL)
    if (!response.ok) return false
    const body = await response.json()
    const fresh = body?.result === "success" ? pickRates(body.rates ?? {}) : null
    if (!fresh) return false
    rates = fresh
    saveState<CachedRates>(RATES_KEY, { rates: fresh, fetchedAt: Date.now() })
    return true
  } catch {
    return false
  }
}

export function symbolFor(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$"
}

export function convertNow(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  return (amount / rates[from]) * rates[to]
}

/** Convert a price stored in USD to another display currency. */
export function displayPrice(amountUSD: number, to: CurrencyCode): number {
  return convertNow(amountUSD, "USD", to)
}

/** Rounds to what the currency shows (whole naira, cents for the rest). */
export function roundFor(amount: number, currency: CurrencyCode): number {
  const factor = currency === "NGN" ? 1 : 100
  return Math.round(amount * factor) / factor
}

/** Stored USD price shown in the host's currency, for the listing forms. */
export function priceForInput(amountUSD: number, currency: CurrencyCode): number {
  return roundFor(displayPrice(amountUSD, currency), currency)
}

/** What the host typed in their currency, back to USD for saving. Kept to 4
 * decimals so the same amount shows again when the listing is edited. */
export function priceToUSD(amount: number, from: CurrencyCode): number {
  return Math.round(convertNow(amount, from, "USD") * 10000) / 10000
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const symbol = symbolFor(currency)
  const digits = currency === "NGN" ? 0 : 2
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}
