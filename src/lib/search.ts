import { useSearchParams } from "react-router-dom";
import type { IProperty } from "../types/listing";
import type { TParty } from "../types/parties";

export interface ListingSearch {
  where: string;
  /** "2026-10-20" */
  from: string;
  to: string;
  type: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const searchToParams = (search: ListingSearch) => {
  const params = new URLSearchParams();
  if (search.where.trim()) params.set("where", search.where.trim());
  if (search.from) params.set("from", search.from);
  if (search.to) params.set("to", search.to);
  if (search.type) params.set("type", search.type);
  return params;
};

/** What the visitor searched for, kept in the page address so it survives a refresh or a shared link. */
export const useListingSearch = () => {
  const [params] = useSearchParams();
  const search: ListingSearch = {
    where: params.get("where") ?? "",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    type: params.get("type") ?? "",
  };
  const isActive = Boolean(search.where || search.from || search.to || search.type);
  return { search, isActive };
};

const wordsIn = (text: string) => text.toLowerCase().split(/[\s,]+/).filter(Boolean);

/** Every word typed has to show up in the place, title or area name. */
const matchesWhere = (where: string, ...fields: (string | undefined)[]) => {
  const words = wordsIn(where);
  if (!words.length) return true;
  const text = fields.join(" ").toLowerCase();
  return words.every((word) => text.includes(word));
};

export interface AreaSuggestion {
  name: string;
  count: number;
}

/** Areas that actually have listings, the ones with the most listings first. */
export const suggestAreas = (locations: string[], typed: string, limit = 6): AreaSuggestion[] => {
  const areas = new Map<string, AreaSuggestion>();
  for (const location of locations) {
    const name = location?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const area = areas.get(key);
    if (area) area.count += 1;
    else areas.set(key, { name, count: 1 });
  }
  const words = wordsIn(typed);
  return [...areas.values()]
    .filter((area) => words.every((word) => area.name.toLowerCase().includes(word)))
    .sort((a, b) => {
      // "lek" should put Lekki above a place that only has "lek" in the middle
      const starts = (area: AreaSuggestion) =>
        words.length && area.name.toLowerCase().startsWith(words[0]) ? 0 : 1;
      return starts(a) - starts(b) || b.count - a.count || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
};

const matchesType = (type: string, listingType?: string) =>
  !type || listingType?.toLowerCase() === type.toLowerCase();

const dayOf = (date: Date | string) => new Date(date).toISOString().slice(0, 10);

/** One day picked counts as just that day. */
const searchedDays = ({ from, to }: ListingSearch) => {
  const first = from || to;
  const last = to || from;
  return { first, last };
};

/** The party runs on at least one of the searched days. */
const partyOnDates = (party: TParty, search: ListingSearch) => {
  const { first, last } = searchedDays(search);
  if (!first) return true;
  if (!party.start_date) return false;
  const start = dayOf(party.start_date);
  const end = party.end_date ? dayOf(party.end_date) : start;
  return start <= last && end >= first;
};

/** The host takes bookings on at least one of the searched days. */
const placeOnDates = (place: IProperty, search: ListingSearch) => {
  const { first, last } = searchedDays(search);
  if (!first) return true;
  const blocked = new Set(place.blocked_dates ?? []);
  for (
    let day = first;
    day <= last;
    day = new Date(Date.parse(`${day}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10)
  ) {
    if (!blocked.has(day)) return true;
  }
  return false;
};

export const partyMatches = (party: TParty, search: ListingSearch, area = "") =>
  matchesWhere(search.where, party.location, party.title, area) &&
  matchesType(search.type, party.party_type) &&
  partyOnDates(party, search);

export const placeMatches = (place: IProperty, search: ListingSearch, area = "") =>
  matchesWhere(search.where, place.location, place.title, area) &&
  matchesType(search.type, place.property_type) &&
  placeOnDates(place, search);

/** Keeps the groups that still have something after the search. */
export const filterGroups = <T, G extends { caption: string }>(
  groups: G[],
  items: (group: G) => T[],
  matches: (item: T, area: string) => boolean,
) =>
  groups
    .map((group) => ({
      caption: group.caption,
      items: items(group).filter((item) => matches(item, group.caption)),
    }))
    .filter((group) => group.items.length > 0);

export const describeSearch = (search: ListingSearch) => {
  const { first, last } = searchedDays(search);
  const format = (day: string) =>
    new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  const dates = first ? (first === last ? format(first) : `${format(first)} – ${format(last)}`) : "";
  return [search.where && `"${search.where}"`, dates, search.type].filter(Boolean).join(" · ");
};
