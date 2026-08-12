import { Minus, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface IStepFiveProps {
  beds: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  setBedrooms: number;
  setBathrooms: number;
  setBeds: number;
  setGuests: Dispatch<SetStateAction<number>>;
}

const StepFive: React.FC<IStepFiveProps> = ({
  guests,
  setGuests,
  bedrooms,
  setBedrooms,
  beds,
  setBeds,
  bathrooms,
  setBathrooms,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="space-y-1.5 mb-6">
        <p className="text-sm font-bold text-purple-600">Step 5</p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Share some basics about your place
        </h2>
        <p className="text-xs font-semibold text-muted-foreground">
          You'll add more details later, like bed types.
        </p>
      </div>

      {/* Basics configuration drawer */}
      <div className="max-w-md mx-auto divide-y divide-border/20">
        {renderCounterRow("Guests", guests, setGuests)}
        {renderCounterRow("Bedroom", bedrooms, setBedrooms as any)}
        {renderCounterRow("Beds", beds, setBeds as any)}
        {renderCounterRow("Bathrooms", bathrooms, setBathrooms as any)}
      </div>
    </div>
  );
};

const renderCounterRow = (
  label: string,
  value: number,
  onChange: (val: number) => void,
  min = 1,
) => {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-5 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <span className="text-base font-bold text-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-97 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-[transform,background-color] duration-160 ease-out"
        >
          <Minus className="h-4.5 w-4.5" />
        </button>
        <span className="w-5 text-center text-base font-bold text-foreground">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-97 cursor-pointer transition-[transform,background-color] duration-160 ease-out"
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

export default StepFive;
