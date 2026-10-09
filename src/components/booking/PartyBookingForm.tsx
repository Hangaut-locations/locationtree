import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useAppContext from "../hooks/useAppContext";
import {
  bookParty,
  savePendingBooking,
  takePendingBooking,
  tripsQueryKey,
} from "../../lib/bookings";
import { displayPrice, formatPrice } from "../../lib/currency";
import { getErrorMessage, type ApiError } from "../../lib/errors";
import { formatPartyWhen, partyLengthInDays } from "../../lib/partyTime";
import type { TParty } from "../../types/parties";

const fieldClass = "mt-1 w-full bg-transparent text-sm outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

type Choices = { guests: number; hours: number; days?: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value) || min));

const PartyBookingForm = ({ party }: { party: TParty }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useAuth();
  const { setIsAuthModal, currency } = useAppContext();
  const perHour = party.charge_type === "hour";
  const perDay = party.charge_type === "day";
  const partyDays = partyLengthInDays(party.start_date, party.end_date);
  const capacity = Number(party.guest_capacity) || 1;
  const price = Number(party.price) || 0;
  const [guests, setGuests] = useState(1);
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(1);
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
        hours: perHour ? choices.hours : undefined,
        days: perDay ? choices.days : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripsQueryKey });
      toast.success("You're booked! You can find it in Reservations.");
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
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
    mutate(saved);
  }, [user, party._id, mutate]);

  const handleBook = () => {
    if (!user) {
      savePendingBooking<Choices>(party._id, { guests, hours, days });
      setIsAuthModal(true);
      return;
    }
    mutate({ guests, hours, days });
  };

  return (
    <>
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
          <input
            type="number"
            min={1}
            max={capacity}
            value={guests}
            onChange={(e) =>
              setGuests(clamp(Number(e.target.value), 1, capacity))
            }
            className={fieldClass}
          />
        </label>
        {perHour && (
          <label className="p-3">
            <span className={labelClass}>Hours</span>
            <input
              type="number"
              min={1}
              max={24}
              value={hours}
              onChange={(e) => setHours(clamp(Number(e.target.value), 1, 24))}
              className={fieldClass}
            />
          </label>
        )}
        {perDay && (
          <label className="p-3">
            <span className={labelClass}>Days</span>
            <input
              type="number"
              min={1}
              max={partyDays}
              value={days}
              onChange={(e) =>
                setDays(clamp(Number(e.target.value), 1, partyDays))
              }
              className={fieldClass}
            />
          </label>
        )}
      </div>
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
        onClick={handleBook}
        disabled={isPending}
        className="mt-5 w-full rounded-xl bg-purple-500 py-3.5 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-60"
      >
        {isPending ? "Booking..." : user ? "Book now" : "Log in to book"}
      </button>
    </>
  );
};

export default PartyBookingForm;
