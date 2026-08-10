import type { Dispatch, SetStateAction } from "react";

interface IStepFiveProps {
  amenities: Set<string>;
  setAmenities: Dispatch<SetStateAction<Set<string>>>;
}

const StepSix: React.FC<IStepFiveProps> = ({ amenities, setAmenities }) => {
  const toggleAmenity = (name: string) => {
    setAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Tell guests what your place has to offer
        </h2>
        <p className="text-xs font-semibold text-muted-foreground">
          You can add more amenities after you publish your listing.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-bold text-foreground">
          What about these guest favorites?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            "Wifi",
            "TV",
            "Kitchen",
            "Washer",
            "Free parking on premises",
            "Paid parking on premises",
            "Air conditioning",
            "Dedicated workspace",
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleAmenity(item)}
              className={`border-2 text-left p-5 rounded-2xl transition-all duration-200 ease cursor-pointer hover:border-gray-400 active:scale-97 ${
                amenities.has(item)
                  ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10 text-purple-950!"
                  : "border-border/80 bg-card text-black"
              }`}
            >
              <span className="text-sm font-semibold">{item}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-bold text-foreground">
          Do you have any standout amenities?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            "Pool",
            "Hot tub",
            "Patio",
            "BBQ gril",
            "Fire pit",
            "Outdor dining area",
            "Pool table",
            "Indoor fireplace",
            "Piano",
            "Exercise equipment",
            "Lake access",
            "Beach access",
            "Ski-in/Ski-out",
            "Outdoor shower",
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleAmenity(item)}
              className={`border-2 text-left p-5 rounded-2xl transition-all duration-200 ease cursor-pointer hover:border-gray-400 active:scale-97 ${
                amenities.has(item)
                  ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10 text-purple-950!"
                  : "border-border/80 bg-card text-black"
              }`}
            >
              <span className="text-sm font-semibold">{item}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-bold text-foreground">
          Do you have any of these safety items?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            "Smoke alarm",
            "First aid kit",
            "Carbon monoxide alarm",
            "Fire extinguisher",
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleAmenity(item)}
              className={`border-2 text-left p-5 rounded-2xl transition-all duration-200 ease cursor-pointer hover:border-gray-400 active:scale-97 ${
                amenities.has(item)
                  ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10 text-purple-950!"
                  : "border-border/80 bg-card text-black"
              }`}
            >
              <span className="text-sm font-semibold">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepSix;
