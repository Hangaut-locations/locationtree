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
}) =>
  adminCaller
    .post<PropertyBooking>("/bookings/properties", data)
    .then((res) => res.data);

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
