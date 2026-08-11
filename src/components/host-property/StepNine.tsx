import type { Dispatch, SetStateAction } from "react";

interface IStepFiveProps {
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
}

const StepNine: React.FC<IStepFiveProps> = ({
  description,
  setDescription,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="space-y-1.5 mb-6">
        <span className="text-sm font-bold text-purple-950 uppercase tracking-widest block">
          Step 8
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Give a precise description of your apartment.
        </h2>
        <p className="text-xs font-semibold text-muted-foreground">
          Keep it short and sweet! Pick a fun title—you can always tweak it
          later.
        </p>
      </div>
      <div className="">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={32}
          className="w-full min-h-52 resize-none border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl"
          placeholder="Input description"
        />
        <p className="mt-2 text-right text-xs font-semibold text-muted-foreground">
          {description.length}/32
        </p>
      </div>
    </div>
  );
};

export default StepNine;
