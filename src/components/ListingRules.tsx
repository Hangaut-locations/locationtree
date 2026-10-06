import { ShieldCheck } from "lucide-react";

interface ListingRulesProps {
  title: string;
  rules?: string;
}

// Hosts type rules as one line per rule, or as a single comma-separated line.
const splitRules = (rules: string) => {
  const lines = rules
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-•*\d.)]+/, "").trim())
    .filter(Boolean);
  if (lines.length > 1) return lines;
  return rules
    .split(/[,;]/)
    .map((rule) => rule.trim())
    .filter(Boolean);
};

const ListingRules = ({ title, rules }: ListingRulesProps) => {
  if (!rules?.trim()) return null;

  return (
    <div className="border-b border-border py-7">
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {splitRules(rules).map((rule, index) => (
          <li key={index} className="flex gap-3 text-sm">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-purple-700" />
            <span className="min-w-0 wrap-break-word">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListingRules;
