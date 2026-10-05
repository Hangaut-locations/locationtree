import type { Dispatch, SetStateAction } from "react";
import LocationPicker from "../global/LocationPicker";

interface IStepFourProps {
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
}

const StepFour: React.FC<IStepFourProps> = ({ location, setLocation }) => (
  <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
    <div className="space-y-1.5 max-w-xl mx-auto">
      <p className="text-sm font-bold text-purple-600">Step 4</p>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
        Where's your place located?
      </h2>
      <p className="text-xs text-muted-foreground">
        Your exact address is only shared with guests after they book.
      </p>
    </div>

    <LocationPicker
      value={location}
      onChange={setLocation}
      quickPicks={["Lekki", "Surulere", "Lagos Island", "Uyo", "Enugu"]}
    />
  </div>
);

export default StepFour;
