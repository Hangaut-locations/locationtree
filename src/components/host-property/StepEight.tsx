import type { Dispatch, SetStateAction } from "react";

interface IStepFiveProps {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
}

const StepEight: React.FC<IStepFiveProps> = ({ title, setTitle }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="space-y-1.5 mb-6">
        <span className="text-sm font-bold text-purple-950 uppercase tracking-widest block">
          Step 7
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Now, let's give your apartment a title
        </h2>
        <p className="text-xs font-semibold text-muted-foreground">
          Keep it short and sweet! Pick a fun title—you can always tweak it
          later.
        </p>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          // rows={4}
          maxLength={32}
          className="w-full resize-none border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl"
          placeholder="Input title"
        />
        {/* <p className="mt-2 text-right text-xs font-semibold text-muted-foreground">
          {title.length}/32
        </p> */}
      </div>
    </div>
  );
};

export default StepEight;
