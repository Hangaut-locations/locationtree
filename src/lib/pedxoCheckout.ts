import type { CurrencyCode } from "./currency";
import { displayPrice, roundFor } from "./currency";

/** Pedxo wallet / Sexyyo checkout site. */
export const PEDXO_WALLET_URL =
  import.meta.env.VITE_PEDXO_WALLET_URL || "https://wallet.pedxo.com";

const CHECKOUT_INTENT_KEY = "hangaut_checkout_intent";
const CHECKOUT_TTL_MS = 60 * 60 * 1000;

export type PartyCheckoutChoices = {
  guests: number;
  hours: number;
  days?: number;
  friends?: { name: string; email?: string }[];
  withoutTicket?: boolean;
  ticketNames: string[];
};

export type PropertyCheckoutChoices = {
  date: string;
  start_time?: string;
  hours?: number;
  days?: number;
  guests: number;
};

export type CheckoutIntent =
  | {
      kind: "party";
      listingId: string;
      orderId: string;
      amount: number;
      currency: CurrencyCode;
      choices: PartyCheckoutChoices;
      savedAt: number;
    }
  | {
      kind: "property";
      listingId: string;
      orderId: string;
      amount: number;
      currency: CurrencyCode;
      choices: PropertyCheckoutChoices;
      savedAt: number;
    };

export const newCheckoutOrderId = () =>
  `HANG-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

/** USD listing total → amount the guest pays in their chosen wallet currency. */
export const checkoutAmount = (totalUsd: number, currency: CurrencyCode) =>
  roundFor(displayPrice(totalUsd, currency), currency);

export const buildPedxoCheckoutUrl = (input: {
  amount: number;
  currency: CurrencyCode;
  orderId: string;
  invoice?: string;
  service?: string;
  returnUrl: string;
  title?: string;
}) => {
  const url = new URL("/checkout", PEDXO_WALLET_URL);
  url.searchParams.set("amount", String(input.amount));
  url.searchParams.set("currency", input.currency);
  url.searchParams.set("order_id", input.orderId);
  url.searchParams.set("invoice", input.invoice || input.orderId);
  url.searchParams.set("service", input.service || "Hangaut");
  if (input.title) url.searchParams.set("title", input.title);
  url.searchParams.set("return_url", input.returnUrl);
  return url.toString();
};

export const hangautPayReturnUrl = (orderId: string) => {
  const url = new URL("/pay/return", window.location.origin);
  url.searchParams.set("order_id", orderId);
  return url.toString();
};

export const saveCheckoutIntent = (intent: CheckoutIntent) => {
  sessionStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify(intent));
};

export const readCheckoutIntent = (orderId?: string): CheckoutIntent | null => {
  const raw = sessionStorage.getItem(CHECKOUT_INTENT_KEY);
  if (!raw) return null;
  try {
    const intent = JSON.parse(raw) as CheckoutIntent;
    if (!intent?.orderId || !intent.savedAt) return null;
    if (Date.now() - intent.savedAt > CHECKOUT_TTL_MS) {
      sessionStorage.removeItem(CHECKOUT_INTENT_KEY);
      return null;
    }
    if (orderId && intent.orderId !== orderId) return null;
    return intent;
  } catch {
    return null;
  }
};

export const clearCheckoutIntent = () =>
  sessionStorage.removeItem(CHECKOUT_INTENT_KEY);

/** Start Pedxo wallet checkout for a paid Hangaut booking. */
export const startPedxoCheckout = (intent: Omit<CheckoutIntent, "savedAt">) => {
  saveCheckoutIntent({ ...intent, savedAt: Date.now() });
  const href = buildPedxoCheckoutUrl({
    amount: intent.amount,
    currency: intent.currency,
    orderId: intent.orderId,
    returnUrl: hangautPayReturnUrl(intent.orderId),
    service: "Hangaut",
  });
  window.location.assign(href);
};
