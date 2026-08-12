import { useEffect, useState, useRef } from "react";
import { ChevronDown, Loader2, Search, Check, X } from "lucide-react";

const API_URL = "https://countriesnow.space/api/v0.1";

type LocationType = "country" | "state" | "city";

interface LocationSelectProps {
  type: LocationType;
  value: string;
  onChange: (value: string) => void;
  country?: string;
  state?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface Country {
  name: string;
  iso2?: string;
  iso3?: string;
}

interface State {
  name: string;
  state_code?: string;
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  type,
  value,
  onChange,
  country,
  state,
  label,
  placeholder,
  disabled = false,
  className = "",
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getDefaultLabel = () => {
    switch (type) {
      case "country":
        return "Country";
      case "state":
        return "State";
      case "city":
        return "City";
    }
  };

  const getDefaultPlaceholder = () => {
    switch (type) {
      case "country":
        return "Select country";
      case "state":
        return "Select state";
      case "city":
        return "Select city";
    }
  };

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/countries/positions`);
      if (!response.ok) throw new Error("Failed to fetch countries");
      const data = await response.json();
      const countries: Country[] = data.data ?? [];
      setOptions(
        countries.map((c) => c.name).sort((a, b) => a.localeCompare(b)),
      );
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    if (!country) return setOptions([]);
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/countries/states`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
      if (!response.ok) throw new Error("Failed to fetch states");
      const data = await response.json();
      const states: State[] = data.data?.states ?? [];
      setOptions(states.map((s) => s.name).sort((a, b) => a.localeCompare(b)));
    } catch (error) {
      console.error("Failed to fetch states:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    if (!country || !state) return setOptions([]);
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/countries/state/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, state }),
      });
      if (!response.ok) throw new Error("Failed to fetch cities");
      const data = await response.json();
      setOptions(
        (data.data ?? []).sort((a: string, b: string) => a.localeCompare(b)),
      );
    } catch (error) {
      console.error("Failed to fetch cities:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type === "country") fetchCountries();
    if (type === "state") fetchStates();
    if (type === "city") fetchCities();
  }, [type, country, state]);

  const isDisabled =
    disabled ||
    loading ||
    (type === "state" && !country) ||
    (type === "city" && (!country || !state));

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
      {/* Label */}
      <span className="text-xs capitalize font-medium tracking-wider text-muted-foreground/80">
        {label ?? getDefaultLabel()}
      </span>

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`
            group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium
            transition-all duration-200 outline-none
            ${
              isOpen
                ? "border-purple-500/80 bg-background shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-2 ring-purple-500/20"
                : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40"
            }
            ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          `}
        >
          <span
            className={`truncate ${
              value ? "text-foreground font-medium" : "text-muted-foreground"
            }`}
          >
            {value || (placeholder ?? getDefaultPlaceholder())}
          </span>

          <div className="flex items-center gap-1.5 pl-2">
            {/* Clear Button */}
            {value && !isDisabled && (
              <span
                onClick={handleClear}
                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}

            {/* Spinner or Arrow */}
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
            ) : (
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground ${
                  isOpen ? "rotate-180 text-purple-500" : ""
                }`}
              />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && !isDisabled && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-2xl border border-border/80 bg-background/95 p-2 shadow-2xl backdrop-blur-xl transition-all duration-200">
            {/* Search Bar */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${getDefaultLabel().toLowerCase()}...`}
                className="w-full rounded-lg bg-muted/40 py-2 pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:bg-muted/70"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 text-sm scrollbar-thin scrollbar-thumb-muted">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`
                        flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors
                        ${
                          isSelected
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium"
                            : "text-foreground hover:bg-muted/60"
                        }
                      `}
                    >
                      <span className="truncate">{option}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelect;
