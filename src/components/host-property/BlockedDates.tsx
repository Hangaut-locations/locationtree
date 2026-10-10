import { CalendarX2, X } from "lucide-react";
import { Calendar } from "../../../components/ui/calendar";
import {
  dateKey,
  formatDay,
  keyToDate,
  todayInNigeria,
} from "../../lib/bookings";

interface BlockedDatesProps {
  dates: string[];
  onChange: (dates: string[]) => void;
}

const BlockedDates = ({ dates, onChange }: BlockedDatesProps) => {
  const today = keyToDate(todayInNigeria());
  const remove = (date: string) => onChange(dates.filter((d) => d !== date));

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-bold text-foreground">Blocked dates</h4>
        <CalendarX2 className="h-5 w-5 shrink-0 text-foreground" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Tap the days your place isn't available. Guests won't be able to book
        them. Tap again to open a day back up.
      </p>

      <div className="mt-4 flex justify-center">
        <Calendar
          mode="multiple"
          selected={dates.map(keyToDate)}
          onSelect={(days) =>
            onChange((days ?? []).map(dateKey).sort())
          }
          disabled={{ before: today }}
          startMonth={today}
          className="rounded-xl border border-border [--cell-size:--spacing(10)]"
          classNames={{
            day_button:
              "data-[selected-single=true]:bg-red-500 data-[selected-single=true]:text-white data-[selected-single=true]:line-through",
          }}
        />
      </div>

      {dates.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">
              {dates.length} day{dates.length === 1 ? "" : "s"} blocked
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {dates.map((date) => (
              <span
                key={date}
                className="flex items-center gap-1 rounded-full bg-red-500/10 py-1 pl-2.5 pr-1 text-xs font-semibold text-red-700 dark:text-red-300"
              >
                {formatDay(date)}
                <button
                  type="button"
                  onClick={() => remove(date)}
                  className="rounded-full p-0.5 hover:bg-red-500/20"
                  aria-label={`Unblock ${formatDay(date)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          No blocked days, guests can book any day.
        </p>
      )}
    </div>
  );
};

export default BlockedDates;
