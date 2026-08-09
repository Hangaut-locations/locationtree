import { Calendar } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface IStepFiveProps {
  bookingSetting: string;
  setBookingSetting: Dispatch<SetStateAction<any>>;
}

const StepEleven: React.FC<IStepFiveProps> = ({
  setBookingSetting,
  bookingSetting,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="space-y-1.5 mb-6">
        <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
          Step 11
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Choose your booking setting
        </h2>
        <p className="text-xs font-semibold text-muted-foreground">
          You can change this at anytime
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setBookingSetting("approve-first")}
          className={`w-full text-left p-5 sm:p-6 border rounded-2xl transition-all duration-200 ease cursor-pointer hover:border-gray-400 active:scale-97 block ${
            bookingSetting === "approve-first"
              ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10 shadow-sm"
              : "border-border/80 bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-foreground">
              Start by Approving Your First 5 Bookings
            </h4>
            <Calendar className="h-5 w-5 text-foreground shrink-0" />
          </div>
          <p className="mt-2 text-xs font-bold text-purple-950 dark:text-purple-300">
            Recommended
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Stay in control early on. After a few guests, switch to Instant Book
            to let bookings happen automatically
          </p>
        </button>

        <button
          type="button"
          onClick={() => setBookingSetting("instant")}
          className={`w-full text-left p-5 sm:p-6 border rounded-2xl transition-all duration-200 ease cursor-pointer hover:border-gray-400 active:scale-97 block ${
            bookingSetting === "instant"
              ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10 shadow-sm"
              : "border-border/80 bg-card"
          }`}
        >
          <h4 className="text-base font-bold text-foreground">
            Allow instant booking
          </h4>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Guests book automatically without needing approval.
          </p>
        </button>
      </div>
    </div>
  );
};

export default StepEleven;
