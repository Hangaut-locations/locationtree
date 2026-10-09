import type { ApiError } from "./errors";

type ListingKind = "party" | "property";

/** Private listings only open with the ?key= from the host's link. */
export const linkKey = () =>
  new URLSearchParams(window.location.search).get("key") ?? undefined;

export const listingPath = (kind: ListingKind, id: string) =>
  `/${kind === "party" ? "parties" : "homes"}/${id}`;

/** Full link to send guests. Private listings carry their key. */
export const listingLink = (
  kind: ListingKind,
  id: string,
  privateKey?: string,
) =>
  `${window.location.origin}${listingPath(kind, id)}${
    privateKey ? `?key=${encodeURIComponent(privateKey)}` : ""
  }`;

/** The API answers 403 when a private listing is opened without its key. */
export const isPrivateError = (err: unknown) =>
  (err as ApiError | null)?.response?.status === 403;
