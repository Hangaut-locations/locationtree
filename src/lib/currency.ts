// Lightweight, mock currency-conversion API.
// Supports: NGN (Nigerian Naira), USD, EUR, GBP.
//
// In production this would be an external endpoint (e.g. fetch rates from an
// exchange-rate service). For this mock we simulate a small network delay and
// resolve static conversion rates relative to USD.

export type CurrencyCode = "USD" | "EUR" | "GBP" | "NGN"

export const CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
]

// Rates relative to 1 USD.
export const RATES_BASE_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1600,
}

const LATENCY = 120

/**
 * Converts `amount` from `from` currency to `to` currency.
 * Simulates an API call by returning a Promise.
 */
export async function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))
  const baseUsd = amount / RATES_BASE_USD[from]
  return baseUsd * RATES_BASE_USD[to]
}

export function symbolFor(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$"
}

/** Synchronous conversion (used for instant display updates). */
export function convertNow(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  return (amount / RATES_BASE_USD[from]) * RATES_BASE_USD[to]
}

/** Convert a price stored in USD to another display currency. */
export function displayPrice(amountUSD: number, to: CurrencyCode): number {
  return convertNow(amountUSD, "USD", to)
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const symbol = symbolFor(currency)
  const digits = currency === "NGN" ? 0 : 2
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}
