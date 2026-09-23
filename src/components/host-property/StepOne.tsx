import type { Dispatch, SetStateAction } from "react";

interface IStepOneProps {
  // title: string;
  // setTitle: Dispatch<SetStateAction<string>>;
}

const StepOne: React.FC<IStepOneProps> = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <p className="text-sm font-bold text-purple-600">Step 1</p>

      <h1 className="text-xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight">
        Tell us about your place
      </h1>
      <p className="text-muted-foreground leading-relaxed max-w-xl text-sm">
        In this step, we’ll ask you what type of space you’re listing and
        whether guests will book the whole place or room. Then tell us the
        location and how many people it can accommodate
      </p>
    </div>
  );
};

export default StepOne;
