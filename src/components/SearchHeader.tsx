import { Calendar, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface SearchHeaderProps {
  onSearch: (filters: {
    destination: string;
    checkIn: string;
    checkOut: string;
  }) => void;
  onFilterClick: () => void;
  activeSearch: { destination: string; checkIn: string; checkOut: string };
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onSearch,
  onFilterClick,
  activeSearch,
}) => {
  const [destination, setDestination] = useState(activeSearch.destination);
  const [checkIn, setCheckIn] = useState(activeSearch.checkIn);
  const [checkOut, setCheckOut] = useState(activeSearch.checkOut);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locations = ["Lagos", "Lekki", "Surulere"];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDestination(activeSearch.destination);
    setCheckIn(activeSearch.checkIn);
    setCheckOut(activeSearch.checkOut);
  }, [activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ destination, checkIn, checkOut });
    setShowDropdown(false);
  };

  const handleLocationSelect = (loc: string) => {
    setDestination(loc);
    setShowDropdown(false);
  };

  const clearDestination = () => {
    setDestination("");
  };

  const isDateInvalid =
    checkIn && checkOut && new Date(checkOut) < new Date(checkIn);

  return (
    <div className="mx-auto my-6 w-full max-w-4xl px-4 sm:px-6">
      <form
        onSubmit={handleSearchSubmit}
        className="relative flex flex-col md:flex-row items-stretch gap-0 rounded-3xl md:rounded-full border border-border bg-card p-2.5 md:p-2 shadow-lg shadow-purple-950/5 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-xl focus-within:ring-2 focus-within:ring-purple-600/20"
      >
        {/* Where Input */}
        <div
          ref={dropdownRef}
          className="relative flex-1 flex flex-col justify-center px-5 py-2.5 border-b md:border-b-0 md:border-r border-border/60 md:h-14"
        >
          <label className="text-[10px] font-bold uppercase tracking-wider text-purple-950 dark:text-purple-300">
            Where
          </label>
          <div className="flex items-center gap-1.5 mt-0.5">
            <input
              type="text"
              placeholder="Search Destination"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-transparent text-sm font-medium text-foreground placeholder-muted-foreground outline-none border-none p-0 focus:ring-0"
            />
            {destination && (
              <button
                type="button"
                onClick={clearDestination}
                className="rounded-full p-2 md:p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 md:right-auto md:w-80 top-[105%] z-50 mt-1.5 rounded-2xl border border-border bg-card p-2 shadow-xl origin-top animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 ease-out">
              <div className="text-[11px] font-bold text-muted-foreground px-3 py-1.5 uppercase tracking-wider">
                Suggested Locations
              </div>
              {locations
                .filter((loc) =>
                  loc.toLowerCase().includes(destination.toLowerCase()),
                )
                .map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocationSelect(loc)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 md:py-2 text-left text-sm font-medium text-foreground hover:bg-muted transition-colors duration-160 ease-out cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span>{loc}</span>
                  </button>
                ))}
              {locations.filter((loc) =>
                loc.toLowerCase().includes(destination.toLowerCase()),
              ).length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground italic">
                  No matches found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Check In Date */}
        <div className="flex-1 flex flex-col justify-center px-5 py-2.5 border-b md:border-b-0 md:border-r border-border/60 md:h-14">
          <label className="text-[10px] font-bold uppercase tracking-wider text-purple-950 dark:text-purple-300">
            Check in
          </label>
          <div className="flex items-center gap-1.5 mt-0.5 relative">
            <Calendar className="h-4 w-4 text-purple-600 pointer-events-none absolute left-0" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent pl-6 text-sm font-medium text-foreground placeholder-muted-foreground outline-none border-none p-0 focus:ring-0 cursor-pointer [color-scheme:light-dark]"
            />
          </div>
        </div>

        {/* Check Out Date */}
        <div className="flex-1 flex flex-col justify-center px-5 py-2.5 md:h-14 relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-purple-950 dark:text-purple-300">
            Check out
          </label>
          <div className="flex items-center gap-1.5 mt-0.5 relative">
            <Calendar className="h-4 w-4 text-purple-600 pointer-events-none absolute left-0" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={`w-full bg-transparent pl-6 text-sm font-medium placeholder-muted-foreground outline-none border-none p-0 focus:ring-0 cursor-pointer [color-scheme:light-dark] ${
                isDateInvalid ? "text-red-500 font-bold" : "text-foreground"
              }`}
            />
          </div>
          {isDateInvalid && (
            <span className="absolute bottom-[-18px] left-5 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
              Must be after check-in
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between md:justify-end gap-2 px-5 py-3 md:py-0 self-center w-full md:w-auto">
          {/* Filter button */}
          <button
            type="button"
            onClick={onFilterClick}
            className="flex items-center justify-center gap-1.5 rounded-full bg-purple-900/10 dark:bg-purple-300/15 hover:bg-purple-900/20 dark:hover:bg-purple-300/25 text-purple-950 dark:text-purple-200 font-semibold py-2.5 px-4 text-sm transition-[background-color,transform] duration-160 ease-out active:scale-97 cursor-pointer flex-1 md:flex-initial"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="text-xs">Filter</span>
          </button>

          {/* Search Button */}
          <button
            type="submit"
            disabled={!!isDateInvalid}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-950 dark:bg-purple-750 text-white shadow-md shadow-purple-900/20 hover:bg-purple-900 hover:md:scale-105 active:scale-97 transition-[transform,background-color] duration-160 ease-out disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex-initial"
            aria-label="Search listings"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
