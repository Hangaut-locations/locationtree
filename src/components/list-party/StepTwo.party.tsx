import { CalendarDays } from "lucide-react";
import { useMemo, useRef, type Dispatch, type SetStateAction } from "react";

interface IStepProps {
  startDate: string;
  endDate: string;
  setEndDate: Dispatch<SetStateAction<string>>;
  setStartDate: Dispatch<SetStateAction<string>>;
}

const openDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
  ref.current?.showPicker?.();
  ref.current?.focus();
};

const PartyStepTwo: React.FC<IStepProps> = ({
  setStartDate,
  startDate,
  endDate,
  setEndDate,
}) => {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];

  /**
   * Calculate the day after the selected start date
   */
  const minimumEndDate = useMemo(() => {
    if (!startDate) {
      return today;
    }

    const [year, month, day] = startDate.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    date.setDate(date.getDate() + 1);

    const nextYear = date.getFullYear();
    const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
    const nextDay = String(date.getDate()).padStart(2, "0");

    return `${nextYear}-${nextMonth}-${nextDay}`;
  }, [startDate, today]);

  /**
   * End date must be strictly after start date
   */
  const isDateValid = !!startDate && !!endDate && endDate > startDate;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="space-y-1.5">
        <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
          Step 2
        </span>

        <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
          When is your party happening?
        </h2>

        <p className="text-xs text-muted-foreground">
          Your party listing is cleared automatically after its end date.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div
            onClick={() => openDatePicker(startDateRef)}
            className="
              flex items-center gap-3
              border border-border/80
              bg-card
              rounded-2xl
              px-4 py-3
              transition-all
              hover:border-purple-500
              focus-within:border-purple-600
              focus-within:ring-2
              focus-within:ring-purple-600/10
              cursor-pointer
            "
          >
            <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />

            <div className="flex flex-col w-full">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Start date
              </span>

              <input
                ref={startDateRef}
                id="start_date"
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value;

                  setStartDate(newStartDate);

                  /**
                   * Clear end date if it is no longer valid
                   */
                  if (endDate && endDate <= newStartDate) {
                    setEndDate("");
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="
                  w-full
                  bg-transparent
                  text-sm
                  font-semibold
                  text-foreground
                  outline-none
                  border-none
                  p-0
                  focus:ring-0
                  cursor-pointer
                  [color-scheme:light_dark]
                "
              />
            </div>
          </div>

          {/* End Date */}
          <div
            onClick={() => openDatePicker(endDateRef)}
            className="
              flex items-center gap-3
              border border-border/80
              bg-card
              rounded-2xl
              px-4 py-3
              transition-all
              hover:border-purple-500
              focus-within:border-purple-600
              focus-within:ring-2
              focus-within:ring-purple-600/10
              cursor-pointer
            "
          >
            <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />

            <div className="flex flex-col w-full">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                End date
              </span>

              <input
                ref={endDateRef}
                id="end_date"
                type="date"
                min={minimumEndDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="
                  w-full
                  bg-transparent
                  text-sm
                  font-semibold
                  text-foreground
                  outline-none
                  border-none
                  p-0
                  focus:ring-0
                  cursor-pointer
                  [color-scheme:light_dark]
                "
              />
            </div>
          </div>
        </div>

        {startDate && endDate && !isDateValid && (
          <p className="text-center text-xs font-semibold text-red-500">
            End date must be after the start date.
          </p>
        )}
      </div>
    </div>
  );
};

export default PartyStepTwo;
