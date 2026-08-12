import type { Dispatch, SetStateAction } from "react";

type TSpaceType = "entire" | "room" | "shared";

interface IStepTwoProps {
  spaceType: TSpaceType;
  setSpaceType: Dispatch<SetStateAction<TSpaceType>>;
}

const StepThree: React.FC<IStepTwoProps> = ({ spaceType, setSpaceType }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out w-full">
      <p className="text-sm font-bold text-purple-600">Step 3</p>

      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight text-center mb-8">
        What type of place will guests have?
      </h2>
      <div className="space-y-4">
        {/* Option 1: Entire Place */}
        <button
          type="button"
          onClick={() => setSpaceType("entire")}
          className={`w-full text-left p-4 sm:p-6 ease transition-all duration-200 border rounded-2xl cursor-pointer hover:border-gray-400 active:scale-97 block ${
            spaceType === "entire"
              ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10"
              : "border-border/80 bg-card"
          }`}
        >
          <h4 className="text-sm font-bold text-foreground">An entire place</h4>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Guest have the whole place to themselves
          </p>
        </button>

        {/* Option 2: Private Room */}
        <button
          type="button"
          onClick={() => setSpaceType("room")}
          className={`w-full text-left p-4 sm:p-6 border rounded-2xl ease transition-all duration-200 cursor-pointer hover:border-gray-400 active:scale-97 block ${
            spaceType === "room"
              ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10"
              : "border-border/80 bg-card"
          }`}
        >
          <h4 className="text-sm font-bold text-foreground">A room</h4>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Guest have their own room in their home, plus access to shared place
          </p>
        </button>

        {/* Option 3: Shared Room */}
        <button
          type="button"
          onClick={() => setSpaceType("shared")}
          className={`w-full text-left p-4 sm:p-6 border rounded-2xl ease transition-all duration-200 cursor-pointer hover:border-gray-400 active:scale-97 block ${
            spaceType === "shared"
              ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10"
              : "border-border/80 bg-card"
          }`}
        >
          <h4 className="text-sm font-bold text-foreground">
            A shared room in a hostel
          </h4>
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            Guests sleep in a shared room in a professionally managed hostel
            with staffs onsite 24/7
          </p>
        </button>
      </div>
    </div>
  );
};

export default StepThree;
