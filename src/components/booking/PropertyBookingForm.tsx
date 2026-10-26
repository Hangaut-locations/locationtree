import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useAppContext from "../hooks/useAppContext";
import CountInput from "../CountInput";
import {
  addDays,
  bookedDays,
  bookProperty,
  dateKey,
  formatDay,
  keyToDate,
  getTakenTimes,
  nigeriaDateTime,
  nigeriaDay,
  savePendingBooking,
  takePendingBooking,
  takenTimesQueryKey,
  todayInNigeria,
  tripsQueryKey,
} from "../../lib/bookings";
import { displayPrice, formatPrice } from "../../lib/currency";
import { getErrorMessage, type ApiError } from "../../lib/errors";
import { linkKey } from "../../lib/privateLink";
import type { IProperty } from "../../types/listing";

const HOUR_MS = 60 * 60 * 1000;
const MAX_NIGHTS = 30;
const fieldClass = "mt-1 w-full bg-transparent text-sm outline-none";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

type Choices = {
  date: string;
  startTime: string;
  hours: number;
  days?: number;
  guests: number;
};

type StayProblem = "blocked" | "booked" | "long" | null;

/** Check-out is the morning they leave, so the nights held are the days before it. */
const nightsBetween = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000),
  );

const PropertyBookingForm = ({ property }: { property: IProperty }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useAuth();
  const { setIsAuthModal, currency } = useAppContext();
  const instant = property.booking_setting === "instant";
  const capacity = Number(property.guest_capacity) || 1;
  const price = Number(property.price) || 0;
  const blocked = property.blocked_dates ?? [];
  const today = keyToDate(todayInNigeria());
  const [isPickingDate, setIsPickingDate] = useState(false);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [stayProblem, setStayProblem] = useState<StayProblem>(null);
  const [startTime, setStartTime] = useState("12:00");
  const [hours, setHours] = useState(2);
  const [guests, setGuests] = useState(1);
  const perDay = property.charge_type === "day";

  const { data: taken = [] } = useQuery({
    queryKey: takenTimesQueryKey(property._id),
    queryFn: () => getTakenTimes(property._id),
  });

  const booked = bookedDays(taken);
  const unavailable = [...blocked, ...booked];
  const unavailableDays = unavailable.map(keyToDate);
  const firstFreeDay = () => {
    // places charged per day can be booked for today
    let day = perDay ? 0 : 1;
    while (unavailable.includes(todayInNigeria(day)) && day < 400) day++;
    return todayInNigeria(day);
  };
  const arrival = checkIn ?? firstFreeDay();
  // Untouched form starts as a one-night stay. A new check-in clears check-out.
  const departure =
    checkIn === null && checkOut === null ? addDays(arrival, 1) : checkOut;
  const nights = departure ? nightsBetween(arrival, departure) : 0;
  const total =
    property.charge_type === "hour"
      ? price * hours
      : perDay
        ? price * (nights > 0 ? nights : 1)
        : price * guests;

  const start = nigeriaDateTime(arrival, startTime || "00:00");
  const end = new Date(start.getTime() + hours * HOUR_MS);
  const inPast = perDay ? arrival < todayInNigeria() : start <= new Date();
  // a late booking can run past midnight into the next day
  const endDay = nigeriaDay(new Date(end.getTime() - 1));
  const stayDays =
    departure && nights > 0
      ? Array.from({ length: nights }, (_, index) => addDays(arrival, index))
      : [arrival];
  const spillDays = !perDay && endDay !== arrival ? [endDay] : [];
  const daysHeld = [...new Set([...stayDays, ...spillDays])];
  const stayHitsBlocked = stayDays.some((day) => blocked.includes(day));
  const stayHitsBooked = stayDays.some((day) => booked.includes(day));
  const isBlocked = daysHeld.some((day) => blocked.includes(day));
  const isBooked = daysHeld.some((day) => booked.includes(day));

  const { mutate, isPending } = useMutation({
    mutationFn: (choices: Choices) =>
      bookProperty({
        propertyId: property._id,
        date: choices.date,
        ...(perDay
          ? { days: choices.days ?? 1 }
          : {
              start_time: choices.startTime,
              hours: choices.hours,
              ...(choices.days && choices.days > 1
                ? { days: choices.days }
                : {}),
            }),
        guests: choices.guests,
        key: linkKey(),
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
    setCheckIn(saved.date);
    setCheckOut(addDays(saved.date, saved.days && saved.days > 0 ? saved.days : 1));
    setStartTime(saved.startTime);
    setHours(saved.hours);
    setGuests(saved.guests);
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
    mutate(saved);
  }, [user, property._id, mutate]);

  const handleBook = () => {
    const choices = { date: arrival, startTime, hours, days: nights, guests };
    if (!user) {
      savePendingBooking<Choices>(property._id, choices);
      setIsAuthModal(true);
      return;
    }
    mutate(choices);
  };

  const pickRange = (range: DateRange | undefined, triggerDate: Date) => {
    const clicked = dateKey(triggerDate);
    const pickingCheckout = checkIn !== null && checkOut === null;
    // A stay that jumps a crossed-out day is thrown away. Say why, and start again on the day they clicked.
    if (pickingCheckout && !range?.to && checkIn !== clicked) {
      const count = nightsBetween(checkIn, clicked);
      if (count > MAX_NIGHTS) {
        setCheckIn(clicked);
        setCheckOut(null);
        setStayProblem("long");
        setIsPickingDate(false);
        return;
      }
      if (count > 1) {
        const held = Array.from({ length: count }, (_, index) =>
          addDays(checkIn, index),
        );
        if (held.some((day) => blocked.includes(day))) {
          setCheckIn(clicked);
          setCheckOut(null);
          setStayProblem("blocked");
          setIsPickingDate(false);
          return;
        }
        if (held.some((day) => booked.includes(day))) {
          setCheckIn(clicked);
          setCheckOut(null);
          setStayProblem("booked");
          setIsPickingDate(false);
          return;
        }
      }
    }
    if (!range?.from) return;
    const from = dateKey(range.from);
    const to = range.to ? dateKey(range.to) : undefined;
    const count = to ? nightsBetween(from, to) : 0;
    if (!to || count < 1) {
      setCheckIn(from);
      setCheckOut(null);
      setStayProblem(null);
      return;
    }
    if (count > MAX_NIGHTS) {
      setCheckIn(from);
      setCheckOut(null);
      setStayProblem("long");
      return;
    }
    const held = Array.from({ length: count }, (_, index) => addDays(from, index));
    if (held.some((day) => blocked.includes(day))) {
      setCheckIn(from);
      setCheckOut(null);
      setStayProblem("blocked");
      return;
    }
    if (held.some((day) => booked.includes(day))) {
      setCheckIn(from);
      setCheckOut(null);
      setStayProblem("booked");
      return;
    }
    setCheckIn(from);
    setCheckOut(to);
    setStayProblem(null);
    setIsPickingDate(false);
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border">
        <Popover open={isPickingDate} onOpenChange={setIsPickingDate}>
          <PopoverTrigger className="col-span-2 grid grid-cols-2 text-left">
            <span className="border-b border-r border-border p-3">
              <span className={labelClass}>Check-in</span>
              <span className={`${fieldClass} flex items-center justify-between gap-2`}>
                {formatDay(arrival)}
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              </span>
            </span>
            <span className="border-b border-border p-3">
              <span className={labelClass}>Check-out</span>
              <span className={`${fieldClass} flex items-center justify-between gap-2`}>
                {departure ? formatDay(departure) : "Add date"}
                <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              </span>
            </span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="range"
              excludeDisabled
              resetOnSelect
              selected={{
                from: keyToDate(arrival),
                to: departure ? keyToDate(departure) : undefined,
              }}
              defaultMonth={keyToDate(arrival)}
              onSelect={(range, triggerDate) => pickRange(range, triggerDate)}
              disabled={[{ before: today }, ...unavailableDays]}
              startMonth={today}
              modifiers={{ unavailable: unavailableDays }}
              modifiersClassNames={{
                unavailable: "line-through decoration-red-500",
              }}
              className="[--cell-size:--spacing(9)]"
            />
            {unavailable.length > 0 && (
              <p className="px-3 pb-3 text-xs text-muted-foreground">
                Crossed out days aren't available.
              </p>
            )}
          </PopoverContent>
        </Popover>
        {perDay ? null : (
          <>
            <label className="border-b border-r border-border p-3">
              <span className={labelClass}>Start time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="border-b border-border p-3">
              <span className={labelClass}>Hours</span>
              <CountInput
                min={1}
                max={24}
                value={hours}
                onChange={setHours}
                className={fieldClass}
              />
            </label>
          </>
        )}
        <label className="col-span-2 p-3">
          <span className={labelClass}>Guests</span>
          <CountInput
            min={1}
            max={capacity}
            value={guests}
            onChange={setGuests}
            className={fieldClass}
          />
        </label>
      </div>

      {stayProblem === "long" && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          A stay can be up to 30 days. Pick an earlier check-out.
        </p>
      )}
      {stayProblem === "blocked" && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          The host isn't taking bookings on one of those days. Pick other
          check-in and check-out dates.
        </p>
      )}
      {stayProblem === "booked" && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          Someone already booked one of those days. Pick other check-in and
          check-out dates.
        </p>
      )}
      {!stayProblem && !departure && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          Pick a check-out date.
        </p>
      )}
      {!stayProblem && departure && stayHitsBlocked && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          {blocked.includes(arrival)
            ? "The host isn't taking bookings that day. Pick another check-in."
            : "The host isn't taking bookings on one of those days. Pick other check-in and check-out dates."}
        </p>
      )}
      {!stayProblem && departure && !stayHitsBlocked && isBlocked && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          This runs into the next day, and the host isn't taking bookings then.
          Pick an earlier time.
        </p>
      )}
      {!stayProblem && departure && !isBlocked && stayHitsBooked && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          {booked.includes(arrival)
            ? "Someone already booked this day. Pick another check-in."
            : "Someone already booked one of those days. Pick other check-in and check-out dates."}
        </p>
      )}
      {!stayProblem &&
        departure &&
        !isBlocked &&
        !stayHitsBooked &&
        isBooked && (
          <p className="mt-2 text-xs font-semibold text-red-500">
            This runs into the next day, and someone already booked it. Pick an
            earlier time.
          </p>
        )}
      {!stayProblem && !isBlocked && !isBooked && inPast && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          {perDay ? "Pick today or a day after." : "Pick a time in the future."}
        </p>
      )}

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted-foreground">
          {formatPrice(displayPrice(price, currency), currency)} x{" "}
          {property.charge_type === "hour"
            ? `${hours} hour${hours === 1 ? "" : "s"}${
                nights > 1 ? ` · ${nights} days` : ""
              }`
            : perDay
              ? `${nights > 0 ? nights : 1} day${nights === 1 ? "" : "s"}`
              : `${guests} guest${guests === 1 ? "" : "s"}${
                  nights > 1 ? ` · ${nights} days` : ""
                }`}
        </span>
        <span className="font-semibold">
          {formatPrice(displayPrice(total, currency), currency)}
        </span>
      </div>
      <button
        type="button"
        onClick={handleBook}
        disabled={
          isPending ||
          isBlocked ||
          isBooked ||
          inPast ||
          (!perDay && !startTime) ||
          !departure ||
          nights < 1 ||
          nights > MAX_NIGHTS ||
          stayProblem !== null
        }
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
