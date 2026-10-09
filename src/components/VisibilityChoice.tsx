import { Globe, Link2 } from "lucide-react";
import type { Visibility } from "../types/listing";

interface VisibilityChoiceProps {
  kind: "party" | "property";
  value: Visibility;
  onChange: (value: Visibility) => void;
}

const VisibilityChoice: React.FC<VisibilityChoiceProps> = ({
  kind,
  value,
  onChange,
}) => {
  const options = [
    {
      id: "public" as const,
      icon: Globe,
      title: "Public",
      text: "Anyone can find it on Hangaut and book.",
    },
    {
      id: "private" as const,
      icon: Link2,
      title: "Private",
      text: `Hidden from the home page and search. Only people you send the ${kind} link to can see it and book.`,
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-foreground">Who can see this {kind}?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all cursor-pointer active:scale-97 ${
              value === option.id
                ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                : "border-border/80 bg-card hover:border-gray-400"
            }`}
          >
            <option.icon className="mt-0.5 h-5 w-5 shrink-0 text-purple-950 dark:text-purple-300" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {option.title}
              </p>
              <p className="text-xs text-muted-foreground">{option.text}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VisibilityChoice;
