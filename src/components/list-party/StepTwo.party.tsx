import { CalendarDays, Clock } from "lucide-react";
import { useRef, type Dispatch, type SetStateAction } from "react";
import { formatStartTime } from "../../lib/partyTime";

interface IStepProps {
  startDate: string;
  endDate: string;
  startTime: string;
  setEndDate: Dispatch<SetStateAction<string>>;
  setStartDate: Dispatch<SetStateAction<string>>;
  setStartTime: Dispatch<SetStateAction<string>>;
}

const openPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
  ref.current?.showPicker?.();
  ref.current?.focus();
};

const fieldClass =
  "flex items-center gap-3 border border-border/80 bg-card rounded-2xl px-4 py-3 transition-all hover:border-purple-500 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10 cursor-pointer";
const hiddenInputClass =
  "w-full invisible absolute inset-0 z-10 bg-transparent text-sm font-semibold text-foreground outline-none border-none p-0 focus:ring-0 cursor-pointer scheme-light-dark";

const PartyStepTwo: React.FC<IStepProps> = ({
  setStartDate,
  startDate,
  endDate,
  setEndDate,
  startTime,
  setStartTime,
}) => {
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];
  const isDateValid = !!startDate && !!endDate && endDate >= startDate;

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
          Your party listing is removed automatically after its end date.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div onClick={() => openPicker(startDateRef)} className={fieldClass}>
            <CalendarDays className="h-7 w-7 text-muted-foreground shrink-0" />
            <div className="flex flex-col w-full relative">
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
                  if (!endDate || endDate < newStartDate) {
                    setEndDate(newStartDate);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className={hiddenInputClass}
              />
              <span className="w-full p-0 text-sm font-semibold">
                {startDate || "Select date"}
              </span>
            </div>
          </div>

          <div onClick={() => openPicker(startTimeRef)} className={fieldClass}>
            <Clock className="h-7 w-7 text-muted-foreground shrink-0" />
            <div className="flex flex-col w-full relative">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                Start time
              </span>
              <input
                ref={startTimeRef}
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={hiddenInputClass}
              />
              <span className="w-full p-0 text-sm font-semibold">
                {startTime ? formatStartTime(startTime) : "Select time"}
              </span>
            </div>
          </div>

          <div onClick={() => openPicker(endDateRef)} className={fieldClass}>
            <CalendarDays className="h-7 w-7 text-muted-foreground shrink-0" />
            <div className="flex flex-col w-full relative">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                End date
              </span>
              <input
                ref={endDateRef}
                id="end_date"
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={hiddenInputClass}
              />
              <span className="w-full p-0 text-sm font-semibold">
                {endDate || "Select date"}
              </span>
            </div>
          </div>
        </div>

        {startDate && endDate && !isDateValid && (
          <p className="text-center text-xs font-semibold text-red-500">
            End date can't be before the start date.
          </p>
        )}
      </div>
    </div>
  );
};

export default PartyStepTwo;
