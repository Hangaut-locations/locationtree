import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useAppContext from "../hooks/useAppContext";
import CountInput from "../CountInput";
import {
  bookParty,
  savePendingBooking,
  takePendingBooking,
  tripsQueryKey,
} from "../../lib/bookings";
import { displayPrice, formatPrice } from "../../lib/currency";
import { getErrorMessage, type ApiError } from "../../lib/errors";
import { formatPartyWhen, partyLengthInDays } from "../../lib/partyTime";
import { linkKey } from "../../lib/privateLink";
import type { PartyFriend } from "../../types/booking";
import type { TParty } from "../../types/parties";

const fieldClass = "mt-1 w-full bg-transparent text-sm outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-muted-foreground";
const friendInputClass =
  "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-purple-500";

type Choices = {
  guests: number;
  hours: number;
  days?: number;
  friends?: PartyFriend[];
  withoutTicket?: boolean;
  ticketName?: string;
};

/** Rows left empty become spots whose codes go to the person booking. */
const filledFriends = (friends: PartyFriend[]) =>
  friends
    .map((friend) => ({
      name: friend.name.trim(),
      email: friend.email?.trim() || undefined,
    }))
    .filter((friend) => friend.name || friend.email);

const PartyBookingForm = ({ party }: { party: TParty }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useAuth();
  const { setIsAuthModal, currency } = useAppContext();
  const needsHost = party.visibility === "private";
  const freeRsvp = String(party.is_ticket_sales) === "false";
  const perHour = party.charge_type === "hour";
  const perDay = party.charge_type === "day";
  const partyDays = partyLengthInDays(party.start_date, party.end_date);
  const options = party.ticket_options ?? [];
  const [ticketName, setTicketName] = useState("");
  const picked = options.find((option) => option.name === ticketName);
  const optionLeft = picked ? (picked.left ?? picked.available) : null;
  const soldOut = optionLeft === 0;
  const room = Number(party.guest_capacity) || 1;
  const capacity =
    optionLeft == null ? room : Math.max(1, Math.min(room, optionLeft));
  const price = picked ? Number(picked.price) || 0 : Number(party.price) || 0;
  const [guests, setGuests] = useState(1);
  useEffect(() => {
    setGuests((current) => Math.min(current, capacity));
  }, [capacity]);
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(1);
  const [friends, setFriends] = useState<PartyFriend[]>([]);
  const friendRows = Array.from(
    { length: guests - 1 },
    (_, index) => friends[index] ?? { name: "", email: "" },
  );
  const updateFriend = (index: number, change: Partial<PartyFriend>) =>
    setFriends(
      friendRows.map((friend, i) =>
        i === index ? { ...friend, ...change } : friend,
      ),
    );
  const missingName = filledFriends(friendRows).some((friend) => !friend.name);
  const total = perHour
    ? price * hours
    : perDay
      ? price * days
      : price * guests;
  const plural = (count: number, word: string) =>
    `${count} ${word}${count === 1 ? "" : "s"}`;

  const { mutate, isPending } = useMutation({
    mutationFn: (choices: Choices) =>
      bookParty({
        partyId: party._id,
        guests: choices.guests,
        friends: filledFriends(choices.friends ?? []).slice(
          0,
          choices.guests - 1,
        ),
        hours: perHour ? choices.hours : undefined,
        days: perDay ? choices.days : undefined,
        key: linkKey(),
        withoutTicket: choices.withoutTicket,
        ticketName: choices.withoutTicket ? undefined : choices.ticketName,
      }),
    onSuccess: (_booking, choices) => {
      qc.invalidateQueries({ queryKey: tripsQueryKey });
      toast.success(
        needsHost
          ? "Request sent. The host will accept or decline it."
          : choices.withoutTicket
            ? "You're in! Your code is on the way by email, no charge."
            : "You're booked! Your codes are on the way by email and in Reservations.",
      );
      navigate("/reservations?tab=trips");
    },
    onError: (err: ApiError) =>
      toast.error(getErrorMessage(err, "Couldn't book this party, try again")),
  });

  useEffect(() => {
    if (!user) return;
    const saved = takePendingBooking<Choices>(party._id);
    if (!saved) return;
    setGuests(saved.guests);
    setHours(saved.hours);
    setDays(saved.days ?? 1);
    setFriends(saved.friends ?? []);
    setTicketName(saved.ticketName ?? "");
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
    mutate(saved);
  }, [user, party._id, mutate]);

  const handleBook = (withoutTicket = false) => {
    const choices = {
      guests,
      hours,
      days,
      friends: friendRows,
      withoutTicket,
      ticketName,
    };
    if (!user) {
      savePendingBooking<Choices>(party._id, choices);
      setIsAuthModal(true);
      return;
    }
    mutate(choices);
  };

  return (
    <>
      {options.length > 0 && (
        <div className="mt-6">
          <span className={labelClass}>Ticket</span>
          <div className="mt-2 grid gap-2">
            <button
              type="button"
              onClick={() => setTicketName("")}
              aria-pressed={ticketName === ""}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                ticketName === ""
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-border"
              }`}
            >
              <span className="font-semibold">Regular</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {formatPrice(displayPrice(Number(party.price) || 0, currency), currency)}{" "}
                per {perHour ? "hour" : perDay ? "day" : "guest"}
              </span>
            </button>
            {options.map((option) => {
              const left = option.left ?? option.available;
              return (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => setTicketName(option.name)}
                  aria-pressed={ticketName === option.name}
                  className={`rounded-xl border px-3 py-2 text-left text-sm ${
                    ticketName === option.name
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border"
                  }`}
                >
                  <span className="font-semibold">{option.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatPrice(displayPrice(Number(option.price) || 0, currency), currency)}{" "}
                    · {left} left
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border">
        <div className="col-span-2 border-b border-border p-3">
          <span className={labelClass}>Date</span>
          <p className="mt-1 text-sm">
            {formatPartyWhen(party) || "Date to be announced"}
          </p>
        </div>
        <label
          className={`p-3 ${perHour || perDay ? "border-r border-border" : "col-span-2"}`}
        >
          <span className={labelClass}>Guests</span>
          <CountInput
            min={1}
            max={capacity}
            value={guests}
            onChange={setGuests}
            className={fieldClass}
          />
        </label>
        {perHour && (
          <label className="p-3">
            <span className={labelClass}>Hours</span>
            <CountInput
              min={1}
              max={24}
              value={hours}
              onChange={setHours}
              className={fieldClass}
            />
          </label>
        )}
        {perDay && (
          <label className="p-3">
            <span className={labelClass}>Days</span>
            <CountInput
              min={1}
              max={partyDays}
              value={days}
              onChange={setDays}
              className={fieldClass}
            />
          </label>
        )}
      </div>
      {friendRows.length > 0 && (
        <div className="mt-4 rounded-xl border border-border p-3">
          <span className={labelClass}>Who's coming with you?</span>
          <p className="mt-1 text-xs text-muted-foreground">
            {needsHost
              ? "Once the host accepts, everyone gets their own code by email. Leave an email blank and that code comes to you instead."
              : "Everyone gets their own code by email to get in at the door. Leave an email blank and that code comes to you instead."}
          </p>
          <div className="mt-3 space-y-3">
            {friendRows.map((friend, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={friend.name}
                  onChange={(e) => updateFriend(index, { name: e.target.value })}
                  placeholder={`Guest ${index + 2} name`}
                  aria-label={`Guest ${index + 2} name`}
                  maxLength={80}
                  className={friendInputClass}
                />
                <input
                  type="email"
                  value={friend.email}
                  onChange={(e) =>
                    updateFriend(index, { email: e.target.value })
                  }
                  placeholder="Email (optional)"
                  aria-label={`Guest ${index + 2} email`}
                  maxLength={254}
                  className={friendInputClass}
                />
              </div>
            ))}
          </div>
          {missingName && (
            <p className="mt-2 text-xs font-semibold text-red-500">
              Add a name for each friend you put an email for.
            </p>
          )}
        </div>
      )}
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted-foreground">
          {formatPrice(displayPrice(price, currency), currency)} x{" "}
          {perHour
            ? plural(hours, "hour")
            : perDay
              ? plural(days, "day")
              : plural(guests, "guest")}
        </span>
        <span className="font-semibold">
          {formatPrice(displayPrice(total, currency), currency)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => handleBook(false)}
        disabled={isPending || missingName || soldOut}
        className="mt-5 w-full rounded-xl bg-purple-500 py-3.5 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-60"
      >
        {isPending
          ? needsHost
            ? "Sending..."
            : "Booking..."
          : user
            ? needsHost
              ? "Request to book"
              : freeRsvp
                ? "Book with a ticket"
                : "Book now"
            : needsHost
              ? "Log in to request"
              : "Log in to book"}
      </button>
      {soldOut && picked && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {picked.name} is sold out. Pick another ticket.
        </p>
      )}
      {freeRsvp && (
        <button
          type="button"
          onClick={() => handleBook(true)}
          disabled={isPending || missingName}
          className="mt-3 w-full rounded-xl border border-border py-3.5 text-sm font-bold transition hover:bg-muted disabled:opacity-60"
        >
          {user ? "Reserve without a ticket" : "Log in to reserve"}
        </button>
      )}
      {freeRsvp && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Free spots still get a code by email.
        </p>
      )}
      {needsHost && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          The host has to accept this before anyone gets a code.
        </p>
      )}
    </>
  );
};

export default PartyBookingForm;
