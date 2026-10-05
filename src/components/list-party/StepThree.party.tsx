import type { Dispatch, SetStateAction } from "react";
import LocationPicker from "../global/LocationPicker";

interface IStepOneProps {
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
}

const PartyStepThree: React.FC<IStepOneProps> = ({ location, setLocation }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
    <div className="space-y-1.5">
      <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
        Step 3
      </span>
      <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
        Where is the party located?
      </h2>
      <p className="text-xs text-muted-foreground">
        The address is only shared with guests after they book a ticket.
      </p>
    </div>

    <LocationPicker
      value={location}
      onChange={setLocation}
      placeholder="Search for the party venue, area or landmark"
      quickPicks={["Lekki", "Surulere", "Lagos", "Uyo", "Enugu"]}
    />
  </div>
);

export default PartyStepThree;
