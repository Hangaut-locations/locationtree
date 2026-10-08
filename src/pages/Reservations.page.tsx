import { useState } from "react";
import { CalendarCheck, Mail, MapPin, Phone, Ticket, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import AppLayout from "../components/layout/AppLayout";
import useAuth from "../components/hooks/useAuth";
import useAppContext from "../components/hooks/useAppContext";
import {
  formatTimeRange,
  getReservations,
  getTrips,
  nigeriaDateTime,
  reservationsQueryKey,
  setBookingStatus,
  tripsQueryKey,
} from "../lib/bookings";
import { displayPrice, formatPrice } from "../lib/currency";
import { getErrorMessage, type ApiError } from "../lib/errors";
import { formatPartyWhen } from "../lib/partyTime";
import type {
  BookingGuest,
  BookingLists,
  BookingStatus,
  PartyBooking,
  PropertyBooking,
} from "../types/booking";

type Tab = "trips" | "hosting";
type Filter = "all" | "parties" | "properties";

type Row =
  | { kind: "parties"; booking: PartyBooking; start: Date; end: Date }
  | { kind: "properties"; booking: PropertyBooking; start: Date; end: Date };

const dayOf = (date: string) => date.slice(0, 10);

const toRows = (lists?: BookingLists): Row[] => [
  ...(lists?.parties ?? []).map((booking) => {
    const start = booking.start_date
      ? nigeriaDateTime(dayOf(booking.start_date), booking.start_time ?? "00:00")
      : new Date(booking.createdAt);
    const end = booking.end_date
      ? nigeriaDateTime(dayOf(booking.end_date), "23:59")
      : start;
    return { kind: "parties" as const, booking, start, end };
  }),
  ...(lists?.properties ?? []).map((booking) => ({
    kind: "properties" as const,
    booking,
    start: new Date(booking.start_at),
    end: new Date(booking.end_at),
  })),
];

const isActive = (status: BookingStatus) =>
  status === "pending" || status === "confirmed";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabel = (status: BookingStatus, tab: Tab) => {
  if (status === "pending") {
    return tab === "hosting" ? "Needs your answer" : "Waiting for host";
  }
  return status[0].toUpperCase() + status.slice(1);
};

const chipClass = (active: boolean) =>
  `rounded-full px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
    active
      ? "bg-purple-950 text-white"
      : "border border-border bg-card text-foreground hover:bg-muted"
  }`;

const ReservationsPage = () => {
  const qc = useQueryClient();
  const { data: user, isLoading: userLoading } = useAuth();
  const { setIsAuthModal, currency } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "hosting" ? "hosting" : "trips";
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading } = useQuery({
    queryKey: tab === "hosting" ? reservationsQueryKey : tripsQueryKey,
    queryFn: tab === "hosting" ? getReservations : getTrips,
    enabled: Boolean(user),
  });

  const { mutate, isPending, variables } = useMutation({
    mutationFn: (change: { row: Row; status: BookingStatus }) =>
      setBookingStatus(change.row.kind, change.row.booking._id, change.status),
    onSuccess: (_res, { status }) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(
        status === "confirmed"
          ? "Booking accepted"
          : status === "declined"
            ? "Booking declined"
            : "Booking cancelled",
      );
    },
    onError: (err: ApiError) =>
      toast.error(getErrorMessage(err, "Couldn't update the booking, try again")),
  });

  const changeStatus = (row: Row, status: BookingStatus) => {
    if (
      status === "cancelled" &&
      !window.confirm("Cancel this booking? This can't be undone.")
    ) {
      return;
    }
    mutate({ row, status });
  };

  const now = new Date();
  const rows = toRows(data).filter(
    (row) => filter === "all" || row.kind === filter,
  );
  const upcoming = rows
    .filter((row) => isActive(row.booking.status) && row.end > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const past = rows
    .filter((row) => !upcoming.includes(row))
    .sort((a, b) => b.start.getTime() - a.start.getTime());

  const renderRow = (row: Row) => {
    const { booking } = row;
    const guest =
      typeof booking.guestId === "object" ? (booking.guestId as BookingGuest) : null;
    const listingPath =
      row.kind === "parties"
        ? `/parties/${row.booking.partyId}`
        : `/homes/${row.booking.propertyId}`;
    const when =
      row.kind === "parties"
        ? formatPartyWhen(row.booking) || "Date to be announced"
        : formatTimeRange(row.booking.start_at, row.booking.end_at);
    const hours = booking.charge_type === "hour" || row.kind === "properties"
      ? row.booking.hours
      : undefined;
    const busy = isPending && variables?.row.booking._id === booking._id;
    const notStarted = row.start > now;
    const canAnswer =
      tab === "hosting" && row.kind === "properties" && booking.status === "pending";
    const canCancel = isActive(booking.status) && notStarted && !canAnswer;

    return (
      <div
        key={booking._id}
        className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Link to={listingPath} className="shrink-0">
            {booking.image ? (
              <img
                src={booking.image}
                alt={booking.title}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                <Ticket className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-purple-950/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-950">
                {row.kind === "parties" ? "Party" : "Home"}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}
              >
                {statusLabel(booking.status, tab)}
              </span>
            </div>
            <Link
              to={listingPath}
              className="mt-1 block truncate text-sm font-bold text-foreground hover:underline"
            >
              {booking.title || "Untitled listing"}
            </Link>
            <p className="text-xs font-semibold text-muted-foreground">{when}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {booking.guests} guest
                {booking.guests === 1 ? "" : "s"}
                {hours ? ` · ${hours} hr${hours === 1 ? "" : "s"}` : ""}
              </span>
              {booking.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {booking.location}
                </span>
              )}
            </p>
            {guest && (
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                <span className="font-semibold text-foreground">
                  {guest.firstName} {guest.lastName}
                </span>
                {guest.phone && (
                  <a
                    href={`tel:${guest.phone}`}
                    className="flex items-center gap-1 text-purple-700 hover:underline"
                  >
                    <Phone className="h-3 w-3" /> {guest.phone}
                  </a>
                )}
                <a
                  href={`mailto:${guest.email}`}
                  className="flex items-center gap-1 text-purple-700 hover:underline"
                >
                  <Mail className="h-3 w-3" /> {guest.email}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <p className="text-sm font-bold text-foreground">
            {formatPrice(displayPrice(booking.total, currency), currency)}
          </p>
          <div className="flex gap-2">
            {canAnswer && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => changeStatus(row, "declined")}
                  className="rounded-full border border-border px-4 py-2 text-xs font-bold hover:bg-muted disabled:opacity-60"
                >
                  Decline
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => changeStatus(row, "confirmed")}
                  className="rounded-full bg-purple-950 px-4 py-2 text-xs font-bold text-white hover:bg-purple-900 disabled:opacity-60"
                >
                  Accept
                </button>
              </>
            )}
            {canCancel && (
              <button
                type="button"
                disabled={busy}
                onClick={() => changeStatus(row, "cancelled")}
                className="rounded-full border border-border px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBody = () => {
    if (userLoading || (user && isLoading)) {
      return (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      );
    }
    if (!user) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-card p-14 text-center">
          <p className="text-base font-bold text-foreground">
            Log in to see your reservations
          </p>
          <button
            type="button"
            onClick={() => setIsAuthModal(true)}
            className="mt-4 rounded-full bg-purple-950 px-6 py-2.5 text-sm font-bold text-white"
          >
            Log in
          </button>
        </div>
      );
    }
    if (!rows.length) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-card p-14 text-center">
          <Ticket className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
          <p className="text-base font-bold text-foreground">
            {tab === "hosting" ? "No guests yet" : "No trips yet"}
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            {tab === "hosting"
              ? "When guests book your parties or homes, they'll show here."
              : "Book a party or a home and it'll show here."}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-8">
        {upcoming.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Upcoming
            </h2>
            {upcoming.map(renderRow)}
          </section>
        )}
        {past.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Past and cancelled
            </h2>
            {past.map(renderRow)}
          </section>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-950/10 text-purple-950">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reservations
            </h1>
            <p className="text-sm font-semibold text-muted-foreground">
              Your trips and the guests booking your listings
            </p>
          </div>
        </div>

        <div className="mb-4 flex rounded-full border border-border bg-muted/40 p-1 sm:w-fit">
          {(
            [
              ["trips", "My trips"],
              ["hosting", "My guests"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSearchParams({ tab: value })}
              className={`flex-1 rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer sm:flex-none ${
                tab === value
                  ? "bg-purple-950 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex gap-2">
          {(
            [
              ["all", "All"],
              ["parties", "Parties"],
              ["properties", "Homes"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={chipClass(filter === value)}
            >
              {label}
            </button>
          ))}
        </div>

        {renderBody()}
      </div>
    </AppLayout>
  );
};

export default ReservationsPage;
