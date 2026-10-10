import { adminCaller, axiosClient } from "../interceptors/http";
import type {
  BookingLists,
  BookingStatus,
  PartyBooking,
  PropertyBooking,
  TakenTime,
} from "../types/booking";

export const tripsQueryKey = ["bookings", "trips"];
export const reservationsQueryKey = ["bookings", "reservations"];
export const takenTimesQueryKey = (propertyId: string) => [
  "bookings",
  "taken",
  propertyId,
];

export const getTrips = () =>
  adminCaller.get<BookingLists>("/bookings/trips").then((res) => res.data);

export const getReservations = () =>
  adminCaller
    .get<BookingLists>("/bookings/reservations")
    .then((res) => res.data);

export const getTakenTimes = (propertyId: string) =>
  axiosClient
    .get<TakenTime[]>(`/bookings/properties/${propertyId}/taken`)
    .then((res) => res.data);

export const bookParty = (data: {
  partyId: string;
  guests: number;
  hours?: number;
  days?: number;
  key?: string;
}) =>
  adminCaller
    .post<PartyBooking>("/bookings/parties", data)
    .then((res) => res.data);

export const bookProperty = (data: {
  propertyId: string;
  date: string;
  start_time: string;
  hours: number;
  guests: number;
  key?: string;
}) =>
  adminCaller
    .post<PropertyBooking>("/bookings/properties", data)
    .then((res) => res.data);

const PENDING_BOOKING_KEY = "pending_booking";
const PENDING_BOOKING_TTL = 15 * 60 * 1000;
/** The login popup reloads the page a second after logging in, a booking started before that reload gets cut off. */
const loggedInOnLoad = Boolean(sessionStorage.getItem("user_token"));

/** Logging in reloads the page, so keep what the guest picked and finish the booking after. */
export const savePendingBooking = <T>(listingId: string, choices: T) =>
  sessionStorage.setItem(
    PENDING_BOOKING_KEY,
    JSON.stringify({ listingId, choices, savedAt: Date.now() }),
  );

export const takePendingBooking = <T>(listingId: string): T | null => {
  const raw = sessionStorage.getItem(PENDING_BOOKING_KEY);
  if (!raw || !loggedInOnLoad) return null;
  try {
    const saved = JSON.parse(raw) as { listingId: string; choices: T; savedAt: number };
    if (saved.listingId !== listingId) return null;
    sessionStorage.removeItem(PENDING_BOOKING_KEY);
    return Date.now() - saved.savedAt < PENDING_BOOKING_TTL ? saved.choices : null;
  } catch {
    sessionStorage.removeItem(PENDING_BOOKING_KEY);
    return null;
  }
};

export const setBookingStatus = (
  kind: "parties" | "properties",
  id: string,
  status: BookingStatus,
) => adminCaller.patch(`/bookings/${kind}/${id}/status`, { status });

/** Times are booked in Nigeria time, whatever the visitor's own timezone is. */
const NIGERIA_TZ = "Africa/Lagos";

export const nigeriaDateTime = (date: string, time: string) =>
  new Date(`${date}T${time}:00+01:00`);

export const todayInNigeria = (daysAhead = 0) =>
  new Date(Date.now() + 60 * 60 * 1000 + daysAhead * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

/** Calendar day picked in a date picker as "2026-10-20" (the picker hands back local dates). */
export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const keyToDate = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatDay = (key: string) =>
  keyToDate(key).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatClock = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: NIGERIA_TZ,
  });

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: NIGERIA_TZ,
  });

/** e.g. "Tue, 20 Oct · 2:00 PM – 5:00 PM" */
export const formatTimeRange = (startAt: string, endAt: string) => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${formatDate(start)} · ${formatClock(start)} – ${formatClock(end)}`;
};

/** e.g. "2:00 PM – 5:00 PM" */
export const formatClockRange = (startAt: string, endAt: string) =>
  `${formatClock(new Date(startAt))} – ${formatClock(new Date(endAt))}`;

export const overlaps = (
  a: { start: Date; end: Date },
  b: { start: Date; end: Date },
) => a.start < b.end && a.end > b.start;
