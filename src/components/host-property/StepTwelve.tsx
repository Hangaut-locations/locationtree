import type { Dispatch, SetStateAction } from "react";

type TMode = "person" | "hour" | "night";

interface IStepProps {
  basePrice: number;
  priceMode: TMode;
  setBasePrice: Dispatch<SetStateAction<number>>;
  setPriceMode: Dispatch<SetStateAction<TMode>>;
}

const StepTwelve: React.FC<IStepProps> = ({
  basePrice,
  setBasePrice,
  priceMode,
  setPriceMode,
}) => {
  return (
    <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="space-y-1.5">
        <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
          Step 12
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Set your base price for the spot
        </h2>
        <p className="text-xs font-semibold text-muted-foreground">
          For example <span className="font-bold text-foreground">$75</span>
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="text-6xl sm:text-7xl font-bold text-foreground">
          $
        </span>
        <input
          type="number"
          min={1}
          value={basePrice}
          onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
          className="w-40 border-r border-border/60 bg-transparent text-center text-6xl sm:text-7xl font-bold text-foreground outline-none"
        />
      </div>

      {/* Price unit selection */}
      <div className="max-w-md mx-auto">
        <p className="text-sm font-bold text-foreground mb-3">Charge per…</p>
        <div className="grid grid-cols-3 gap-3">
          {(["person", "hour", "night"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPriceMode(mode)}
              className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-all cursor-pointer active:scale-97 ${
                priceMode === mode
                  ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                  : "border-border/80 bg-card hover:border-gray-400"
              }`}
            >
              <span className="text-foreground capitalize">/ {mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* <button
        type="button"
        onClick={handleSubmit}
        className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3 px-8 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out cursor-pointer"
      >
        Publish now
      </button> */}
    </div>
  );
};

export default StepTwelve;
