import type { Dispatch, SetStateAction } from "react";

interface IStepOneProps {
  // title: string;
  // setTitle: Dispatch<SetStateAction<string>>;
}

const StepOne: React.FC<IStepOneProps> = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
        Step 1
      </span>
      <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
        Tell us about your place
      </h1>
      <p className="text-base font-semibold text-muted-foreground leading-relaxed max-w-xl">
        In this step, we’ll ask you what type of space you’re listing and
        whether guests will book the whole place or room. Then tell us the
        location and how many people it can accommodate
      </p>
    </div>
  );
};

export default StepOne;
