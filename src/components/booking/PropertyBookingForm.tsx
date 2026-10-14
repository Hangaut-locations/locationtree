import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
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
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("12:00");
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(1);
  const [guests, setGuests] = useState(1);
  const perDay = property.charge_type === "day";
  const total =
    property.charge_type === "hour"
      ? price * hours
      : perDay
        ? price * days
        : price * guests;

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
  const date = pickedDate ?? firstFreeDay();

  const start = nigeriaDateTime(date, startTime || "00:00");
  const end = new Date(start.getTime() + hours * HOUR_MS);
  const inPast = perDay ? date < todayInNigeria() : start <= new Date();
  // a late booking can run past midnight into the next day
  const endDay = nigeriaDay(new Date(end.getTime() - 1));
  const daysHeld = perDay
    ? Array.from({ length: days }, (_, index) => addDays(date, index))
    : [date, endDay];
  const isBlocked = daysHeld.some((day) => blocked.includes(day));
  const isBooked = daysHeld.some((day) => booked.includes(day));

  const { mutate, isPending } = useMutation({
    mutationFn: (choices: Choices) =>
      bookProperty({
        propertyId: property._id,
        date: choices.date,
        ...(perDay
          ? { days: choices.days ?? 1 }
          : { start_time: choices.startTime, hours: choices.hours }),
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
    setPickedDate(saved.date);
    setStartTime(saved.startTime);
    setHours(saved.hours);
    setDays(saved.days ?? 1);
    setGuests(saved.guests);
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
    mutate(saved);
  }, [user, property._id, mutate]);

  const handleBook = () => {
    const choices = { date, startTime, hours, days, guests };
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
        <div className="border-b border-r border-border p-3">
          <span className={labelClass}>Date</span>
          <Popover open={isPickingDate} onOpenChange={setIsPickingDate}>
            <PopoverTrigger
              className={`${fieldClass} flex items-center justify-between gap-2 text-left`}
            >
              {formatDay(date)}
              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={keyToDate(date)}
                defaultMonth={keyToDate(date)}
                onSelect={(day) => {
                  if (!day) return;
                  setPickedDate(dateKey(day));
                  setIsPickingDate(false);
                }}
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
        </div>
        {perDay ? (
          <label className="border-b border-border p-3">
            <span className={labelClass}>Days</span>
            <CountInput
              min={1}
              max={30}
              value={days}
              onChange={setDays}
              className={fieldClass}
            />
          </label>
        ) : (
          <>
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
        <label className={`p-3 ${perDay ? "col-span-2" : ""}`}>
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

      {isBlocked && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          {blocked.includes(date)
            ? "The host isn't taking bookings that day. Pick another day."
            : perDay
              ? "The host isn't taking bookings on one of those days. Pick fewer days or another date."
              : "This runs into the next day, and the host isn't taking bookings then. Pick an earlier time."}
        </p>
      )}
      {!isBlocked && isBooked && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          {booked.includes(date)
            ? "Someone already booked this day. Pick another day."
            : perDay
              ? "Someone already booked one of those days. Pick fewer days or another date."
              : "This runs into the next day, and someone already booked it. Pick an earlier time."}
        </p>
      )}
      {!isBlocked && !isBooked && inPast && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          {perDay ? "Pick today or a day after." : "Pick a time in the future."}
        </p>
      )}

      <div className="mt-4 flex justify-between text-sm">
        <span className="text-muted-foreground">
          {formatPrice(displayPrice(price, currency), currency)} x{" "}
          {property.charge_type === "hour"
            ? `${hours} hour${hours === 1 ? "" : "s"}`
            : perDay
              ? `${days} day${days === 1 ? "" : "s"}`
              : `${guests} guest${guests === 1 ? "" : "s"}`}
        </span>
        <span className="font-semibold">
          {formatPrice(displayPrice(total, currency), currency)}
        </span>
      </div>
      <button
        type="button"
        onClick={handleBook}
        disabled={
          isPending || isBlocked || isBooked || inPast || (!perDay && !startTime)
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
