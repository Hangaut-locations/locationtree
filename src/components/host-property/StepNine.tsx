import type { Dispatch, SetStateAction } from "react";

interface IStepFiveProps {
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  rules: string;
  setRules: Dispatch<SetStateAction<string>>;
}

const StepNine: React.FC<IStepFiveProps> = ({
  description,
  setDescription,
  rules,
  setRules,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="space-y-1.5 mb-6">
        <p className="text-sm font-bold text-purple-600">Step 9</p>

        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Give a precise description of your apartment.
        </h2>
        <p className="text-xs text-muted-foreground">
          Keep it short and sweet. You can always tweak it later.
        </p>
      </div>
      <div className="">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={150}
          className="w-full min-h-52 resize-none border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl"
          placeholder="A stylish space designed for memorable stays, calm mornings, and easy hosting."
        />
        <p className="mt-2 text-right text-xs font-semibold text-muted-foreground">
          {description.length}/150
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="property-rules"
          className="block text-base font-bold text-foreground"
        >
          House rules{" "}
          <span className="text-xs font-semibold text-muted-foreground">
            (optional)
          </span>
        </label>
        <p className="text-xs text-muted-foreground">
          Put each rule on its own line so guests know what's allowed.
        </p>
        <textarea
          id="property-rules"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={4}
          className="w-full min-h-36 resize-none border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl text-sm"
          placeholder={"No smoking indoors\nNo parties after 11pm\nCheck-out by 12 noon"}
        />
      </div>
    </div>
  );
};

export default StepNine;
