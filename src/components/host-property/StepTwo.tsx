import { Property_Types } from "../../data/constants";
import type { Dispatch, SetStateAction } from "react";

interface IStepTwoProps {
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
}

const StepTwo: React.FC<IStepTwoProps> = ({ category, setCategory }) => {
  const categories = Property_Types.map((item) => ({
    name: item.name,
    icon: item.icon,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight text-center mb-8">
        Which of these best describes your place?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((cat, index) => {
          const isSelected = category === cat.name;
          return (
            <button
              key={index}
              onClick={() => setCategory(cat.name)}
              className={`flex flex-col items-center justify-center p-4 sm:p-6 border rounded-2xl transition-all duration-200 ease cursor-pointer hover:border-gray-400 active:scale-97 ${
                isSelected
                  ? "border-purple-950 dark:border-purple-600 bg-purple-950/10 dark:bg-purple-800/10 shadow-sm"
                  : "border-border/80 bg-card hover:bg-gray-50"
              }`}
            >
              <img
                src={cat.icon}
                alt={cat.name}
                className="h-7 w-7 lg:w-10 lg:h-10 text-foreground mb-3"
              />
              <span className="text-xs font-bold text-foreground">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepTwo;
