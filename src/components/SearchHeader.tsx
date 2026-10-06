import { Search, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Party_Types } from "../data/constants";
import DateSelector from "./search-header/DateSelect";
import { formatDateShort } from "../../lib/utils";

interface SearchHeaderProps {
  where?: string;
  location?: string;
  thirdLabel?: string;
}

const partiesCategories = Party_Types.map((itm) => ({
  id: itm.name,
  name: itm.name,
  icon: itm.icon,
}));

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  location,
  where,
  thirdLabel,
}) => {
  const [activeBtn, setActiveBtn] = useState(0);
  const [destination, setDestination] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showDropdown, setShowDropdown] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const isDateInvalid =
    startDate && endDate && new Date(endDate) < new Date(startDate);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveBtn(0);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={headerRef}
      className="mx-auto mb-6 mt-3 w-full px-4 sm:w-max sm:min-w-[700px] sm:px-0"
    >
      <div
        className={`relative
      ${activeBtn > 0 && "bg-[#EBEBEB]!"}
      grid grid-cols-1 p-0.5 sm:grid-cols-3 items-stretch gap-0 rounded-3xl md:rounded-full border border-gray-200 bg-card shadow-xl transition-all duration-500 ease`}
      >
        {/* Where Input */}
        <div
          onClick={() => setActiveBtn(1)}
          className={`${activeBtn === 1 ? "bg-white ease transition-all shadow-md" : "hover:bg-[#e5e5e5c0]"}
          ease transition-all duration-150 text-xs font-semibold pl-7 py-3 rounded-full z-10`}
        >
          <button
            className={`${activeBtn < 2 && "sm:border-r"} hover:border-none relative flex flex-col items-start justify-center w-full`}
          >
            <p className="tracking-wider text-[#222] text-[11px]">Where</p>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Search Destination"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  // setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-[95%] bg-transparent text-foreground placeholder-muted-foreground outline-none border-none p-0 focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setDestination("")}
                className={`${startDate && endDate && activeBtn === 2 ? "visible" : "invisible"} ease transition-all duration-300 rounded-full absolute right-2 top-2 p-2 md:p-1.5 hover:bg-muted text-muted-foreground`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Autocomplete Dropdown */}
          </button>
        </div>

        {/* Check In Date */}
        <div
          onClick={() => setActiveBtn(2)}
          className={`${activeBtn === 2 ? "bg-white ease transition-all" : "hover:bg-[#e5e5e5c0]"}
            relative py-3 pl-7 text-xs rounded-full z-10 hover:border-none`}
        >
          <button
            className={`${activeBtn > 0 && "sm:border-r"} font-semibold hover:border-none relative flex flex-col items-start justify-center w-full`}
          >
            <p className="tracking-wider text-[#222] text-[11px]">When</p>
            <p
              className={`${startDate || endDate ? "text-[#222]" : "text-gray-500"} text-xs`}
            >
              {startDate || endDate
                ? `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`
                : "Add dates"}
            </p>

            <button
              type="button"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              className={`${startDate && endDate && activeBtn === 2 ? "visible" : "invisible"} ease transition-all duration-300 rounded-full absolute right-2 top-2 p-2 md:p-1.5 hover:bg-muted text-muted-foreground`}
            >
              <X className="h-3 w-3" />
            </button>
          </button>

          <DateSelector
            isOpen={activeBtn === 2}
            startDate={startDate as Date}
            endDate={endDate as Date}
            onStartDateChange={(date) => setStartDate(date)}
            onEndDateChange={(date) => setEndDate(date)}
          />
        </div>

        {/*  */}
        <div
          onClick={() => setActiveBtn(3)}
          className={`${activeBtn === 3 ? "bg-white ease transition-all" : "hover:bg-[#e5e5e5c0]"}
            py-3 pl-4 text-xs rounded-full z-10 font-semibold relative`}
        >
          <button className="relative flex flex-col items-start justify-center w-full">
            <div className="w-full flex flex-col justify-center items-start relative">
              <p className="tracking-wider text-[#222] text-[11px]">
                Type of party
              </p>
              <p className="text-gray-500 font-semibold">
                {type || "Add party"}
              </p>
            </div>

            <div className="absolute right-2 top- group">
              {/* Search Button */}
              <button
                className="flex gap-3 h-11 w-max ease transition-all duration-300 min-w-11 items-center justify-center rounded-full bg-purple-950 dark:bg-purple-750 text-white shadow-md shadow-purple-900/20 hover:bg-purple-900 hover:md:scale-105 active:scale-97 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                aria-label="Search parties"
              >
                <p className="hidden pl-4 group-hover:flex font-semibold text-white text-xs">
                  Search
                </p>
                <Search className="h-4 w-4" />
              </button>
            </div>
          </button>

          {activeBtn === 3 && (
            <div className="absolute top-16 inset-x-0 z-20 sm:left-auto sm:right-0 max-h-96 overflow-y-auto bg-white rounded-2xl sm:min-w-[700px] shadow-lg p-5 md:p-8 lg:p-10 grid gap-x-2 gap-y-3 grid-cols-2 sm:grid-cols-4 md:grid-cols-3">
              {partiesCategories.map((itm, idx) => (
                <button
                  key={idx}
                  onClick={() => setType(itm.name)}
                  className={`${type === itm.name ? "border-gray-400 bg-gray-50" : ""} cursor-pointer flex justify-center items-center gap-1 py-3 px-2.5 border hover:border-gray-400 ease transition-all duration-200 rounded-full`}
                >
                  <itm.icon size={16} />
                  <p className="text-[11px] font-medium text-[#222]">
                    {itm.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
      </div>
    </div>
  );
};
