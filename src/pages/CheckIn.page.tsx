import { type FormEvent, useCallback, useState } from "react";
import { ArrowLeft, CheckCircle2, QrCode, Search, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import useAuth from "../components/hooks/useAuth";
import useAppContext from "../components/hooks/useAppContext";
import {
  checkInGuest,
  getPartyGuests,
  partyGuestsQueryKey,
  reservationsQueryKey,
} from "../lib/bookings";
import { getErrorMessage, type ApiError } from "../lib/errors";
import type { CheckInResult } from "../types/booking";
import QrScanner from "../components/checkin/QrScanner";

type Outcome =
  | { ok: true; result: CheckInResult }
  | { ok: false; message: string };

const clock = (date: string) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });

const CheckInPage = () => {
  const { partyId = "" } = useParams();
  const qc = useQueryClient();
  const { data: user, isLoading: userLoading } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: partyGuestsQueryKey(partyId),
    queryFn: () => getPartyGuests(partyId),
    enabled: Boolean(user && partyId),
    retry: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: checkInGuest,
    onSuccess: (result) => {
      setOutcome({ ok: true, result });
      setCode("");
      qc.invalidateQueries({ queryKey: partyGuestsQueryKey(partyId) });
      qc.invalidateQueries({ queryKey: reservationsQueryKey });
    },
    onError: (err: ApiError) =>
      setOutcome({
        ok: false,
        message: getErrorMessage(err, "Couldn't check that code, try again"),
      }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) mutate(code.trim());
  };

  const onScan = useCallback(
    (value: string) => {
      setScanning(false);
      setCode(value);
      mutate(value);
    },
    [mutate],
  );

  const term = search.trim().toLowerCase();
  const guests = (data?.guests ?? []).filter(
    (guest) =>
      !term ||
      guest.name.toLowerCase().includes(term) ||
      guest.booked_by.toLowerCase().includes(term),
  );

  const renderBody = () => {
    if (userLoading || (user && isLoading)) {
      return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;
    }
    if (!user) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-card p-14 text-center">
          <p className="text-base font-bold text-foreground">
            Log in to check in your guests
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
    if (isError || !data) {
      return (
        <div className="rounded-3xl border border-dashed border-border bg-card p-14 text-center">
          <p className="text-base font-bold text-foreground">
            Couldn't find this party
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Only the host can see its guest list.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <form
          onSubmit={submit}
          className="rounded-3xl border border-border bg-card p-5"
        >
          <label
            htmlFor="door-code"
            className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            Guest's code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="door-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="K7M2-QX9P"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={20}
              className="min-w-0 flex-1 rounded-xl border border-border bg-transparent px-4 py-3 font-mono text-lg font-bold tracking-widest outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => setScanning((open) => !open)}
              aria-pressed={scanning}
              aria-label="Scan QR"
              className="flex items-center justify-center rounded-xl border border-border px-3 text-foreground"
            >
              <QrCode className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={isPending || !code.trim()}
              className="rounded-xl bg-purple-500 px-5 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-60"
            >
              {isPending ? "Checking..." : "Check in"}
            </button>
          </div>
          {scanning && (
            <QrScanner onCode={onScan} onClose={() => setScanning(false)} />
          )}

          {outcome?.ok && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-green-50 p-4 text-green-900">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
              <div>
                <p className="font-bold">{outcome.result.name} is in</p>
                <p className="text-sm">
                  Booked by {outcome.result.booked_by} ·{" "}
                  {outcome.result.group_checked_in} of {outcome.result.group}{" "}
                  in their group checked in
                </p>
              </div>
            </div>
          )}
          {outcome && !outcome.ok && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-red-50 p-4 text-red-900">
              <XCircle className="h-6 w-6 shrink-0 text-red-500" />
              <p className="font-bold">{outcome.message}</p>
            </div>
          )}
        </form>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Guest list
            </h2>
            <label className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search names"
                aria-label="Search names"
                className="w-40 bg-transparent text-sm outline-none"
              />
            </label>
          </div>

          {data.guests.length === 0 && data.without_codes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm font-semibold text-muted-foreground">
              No one has booked yet.
            </div>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
              {guests.map((guest, index) => (
                <div
                  key={`${guest.booking_id}-${index}`}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {guest.name}
                    </p>
                    {guest.booked_by !== guest.name && (
                      <p className="truncate text-xs text-muted-foreground">
                        With {guest.booked_by}
                      </p>
                    )}
                  </div>
                  {guest.checked_in_at ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-800">
                      In at {clock(guest.checked_in_at)}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Not yet
                    </span>
                  )}
                </div>
              ))}
              {term && guests.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No one called "{search.trim()}".
                </p>
              )}
            </div>
          )}

          {data.without_codes.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-4">
              <p className="text-sm font-bold text-foreground">
                Booked before codes
              </p>
              <p className="text-xs text-muted-foreground">
                These don't have codes, check them by name.
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {data.without_codes.map((booking, index) => (
                  <li key={`${booking.booked_by}-${index}`}>
                    {booking.booked_by}
                    <span className="text-muted-foreground">
                      {" "}
                      · {booking.spots} spot{booking.spots === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
        <Link
          to="/reservations?tab=hosting"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> My guests
        </Link>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Check in guests
            </h1>
            {data && (
              <p className="truncate text-sm font-semibold text-muted-foreground">
                {data.title}
              </p>
            )}
          </div>
          {data && (
            <p className="text-right">
              <span className="text-2xl font-bold text-foreground">
                {data.checked_in}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">
                {" "}
                / {data.spots} in
              </span>
            </p>
          )}
        </div>
        {renderBody()}
      </div>
    </AppLayout>
  );
};

export default CheckInPage;
