import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useAppContext from "../hooks/useAppContext";
import {
  bookProperty,
  formatClockRange,
  getTakenTimes,
  nigeriaDateTime,
  overlaps,
  savePendingBooking,
  takePendingBooking,
  takenTimesQueryKey,
  todayInNigeria,
  tripsQueryKey,
} from "../../lib/bookings";
import { displayPrice, formatPrice } from "../../lib/currency";
import { getErrorMessage, type ApiError } from "../../lib/errors";
import type { IProperty } from "../../types/listing";

const HOUR_MS = 60 * 60 * 1000;
const fieldClass = "mt-1 w-full bg-transparent text-sm outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

type Choices = { date: string; startTime: string; hours: number; guests: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value) || min));

const PropertyBookingForm = ({ property }: { property: IProperty }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useAuth();
  const { setIsAuthModal, currency } = useAppContext();
  const instant = property.booking_setting === "instant";
  const capacity = Number(property.guest_capacity) || 1;
  const price = Number(property.price) || 0;
  const [date, setDate] = useState(() => todayInNigeria(1));
  const [startTime, setStartTime] = useState("12:00");
  const [hours, setHours] = useState(2);
  const [guests, setGuests] = useState(1);
  const total = property.charge_type === "hour" ? price * hours : price * guests;

  const { data: taken = [] } = useQuery({
    queryKey: takenTimesQueryKey(property._id),
    queryFn: () => getTakenTimes(property._id),
  });

  const dayStart = nigeriaDateTime(date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 24 * HOUR_MS);
  const takenThatDay = taken.filter((slot) =>
    overlaps(
      { start: new Date(slot.start_at), end: new Date(slot.end_at) },
      { start: dayStart, end: dayEnd },
    ),
  );
  const start = nigeriaDateTime(date, startTime || "00:00");
  const end = new Date(start.getTime() + hours * HOUR_MS);
  const clashes = takenThatDay.some((slot) =>
    overlaps(
      { start: new Date(slot.start_at), end: new Date(slot.end_at) },
      { start, end },
    ),
  );
  const inPast = start <= new Date();

  const { mutate, isPending } = useMutation({
    mutationFn: (choices: Choices) =>
      bookProperty({
        propertyId: property._id,
        date: choices.date,
        start_time: choices.startTime,
        hours: choices.hours,
        guests: choices.guests,
      }),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: tripsQueryKey });
      qc.invalidateQueries({ queryKey: takenTimesQueryKey(property._id) });
      toast.success(
        booking.status === "confirmed"
          ? "You're booked! You can find it in Reservations."
          : "Request sent. The host will accept or decline it.",
      );
      navigate("/reservations?tab=trips");
    },
    onError: (err: ApiError) => {
      qc.invalidateQueries({ queryKey: takenTimesQueryKey(property._id) });
      toast.error(getErrorMessage(err, "Couldn't book this place, try again"));
    },
  });

  useEffect(() => {
    if (!user) return;
    const saved = takePendingBooking<Choices>(property._id);
    if (!saved) return;
    setDate(saved.date);
    setStartTime(saved.startTime);
    setHours(saved.hours);
    setGuests(saved.guests);
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
    mutate(saved);
  }, [user, property._id, mutate]);

  const handleBook = () => {
    const choices = { date, startTime, hours, guests };
    if (!user) {
      savePendingBooking<Choices>(property._id, choices);
      setIsAuthModal(true);
      return;
    }
    mutate(choices);
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border">
        <label className="border-b border-r border-border p-3">
          <span className={labelClass}>Date</span>
          <input
            type="date"
            min={todayInNigeria()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="border-b border-border p-3">
          <span className={labelClass}>Start time</span>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="border-r border-border p-3">
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
        <label className="p-3">
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
      </div>

      {takenThatDay.length > 0 && (
        <div className="mt-3 text-xs">
          <p className="font-semibold text-muted-foreground">
            Already booked that day:
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {takenThatDay.map((slot) => (
              <span
                key={slot.start_at}
                className="rounded-full bg-muted px-2.5 py-1 font-semibold"
              >
                {formatClockRange(slot.start_at, slot.end_at)}
              </span>
            ))}
          </div>
        </div>
      )}
      {clashes && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          That time is already booked. Pick another time.
        </p>
      )}
      {!clashes && inPast && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          Pick a time in the future.
        </p>
      )}

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted-foreground">
          {formatPrice(displayPrice(price, currency), currency)} x{" "}
          {property.charge_type === "hour"
            ? `${hours} hour${hours === 1 ? "" : "s"}`
            : `${guests} guest${guests === 1 ? "" : "s"}`}
        </span>
        <span className="font-semibold">
          {formatPrice(displayPrice(total, currency), currency)}
        </span>
      </div>
      <button
        type="button"
        onClick={handleBook}
        disabled={isPending || clashes || inPast || !startTime}
        className="mt-5 w-full rounded-xl bg-purple-500 py-3.5 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-60"
      >
        {isPending
          ? "Booking..."
          : !user
            ? "Log in to book"
            : instant
              ? "Book now"
              : "Request to book"}
      </button>
    </>
  );
};

export default PropertyBookingForm;
