import { Minus, Plus } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog"

export interface FilterState {
  placeType: "any" | "room" | "entire"
  minPrice: number
  maxPrice: number
  bedrooms: number
  beds: number
  adults: number
  children: number
  pets: number
}

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onApply: (filters: FilterState) => void
  filteredCount: number
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, onApply, filteredCount }) => {
  const [placeType, setPlaceType] = useState<FilterState["placeType"]>(filters.placeType)
  const [minPrice, setMinPrice] = useState(filters.minPrice)
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice)
  const [bedrooms, setBedrooms] = useState(filters.bedrooms)
  const [beds, setBeds] = useState(filters.beds)
  const [adults, setAdults] = useState(filters.adults)
  const [children, setChildren] = useState(filters.children)
  const [pets, setPets] = useState(filters.pets)

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setPlaceType(filters.placeType)
      setMinPrice(filters.minPrice)
      setMaxPrice(filters.maxPrice)
      setBedrooms(filters.bedrooms)
      setBeds(filters.beds)
      setAdults(filters.adults)
      setChildren(filters.children)
      setPets(filters.pets)
    }
  }, [isOpen, filters])

  const handleApply = () => {
    onApply({
      placeType,
      minPrice,
      maxPrice,
      bedrooms,
      beds,
      adults,
      children,
      pets,
    })
    onClose()
  }

  const handleClearAll = () => {
    setPlaceType("any")
    setMinPrice(180)
    setMaxPrice(2610)
    setBedrooms(1)
    setBeds(1)
    setAdults(1)
    setChildren(1)
    setPets(1)
  }

  const renderCounter = (label: string, value: number, onChange: (val: number) => void, min = 0, max = 10) => {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-black text-gray-800 dark:text-gray-200">{label}</span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="h-9 w-9 rounded-full border border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-500 hover:bg-muted active:scale-97 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-[transform,background-color] duration-160 ease-out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-sm font-black text-gray-900 dark:text-white w-4 text-center">{value}</span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="h-9 w-9 rounded-full border border-gray-400 dark:border-gray-500 flex items-center justify-center text-gray-500 hover:bg-muted active:scale-97 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-[transform,background-color] duration-160 ease-out"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Dialog matches the compact square layout shown in the screenshot */}
      <DialogContent className="w-full max-w-full sm:max-w-[680px] h-full sm:h-auto rounded-none sm:rounded-[32px] border-t sm:border border-border bg-card p-0 shadow-2xl animate-in fade-in sm:zoom-in-95 duration-200 top-0 left-0 sm:top-1/2 sm:left-1/2 translate-x-0 translate-y-0 sm:-translate-x-1/2 sm:-translate-y-1/2 overflow-hidden">
        {/* Title Header */}
        <div className="flex items-center justify-center border-b border-border/60 py-5">
          <DialogTitle className="text-lg font-black text-foreground tracking-tight">Filter</DialogTitle>
        </div>

        {/* Content Body */}
        <div className="px-5 py-6 sm:px-10 sm:py-8 space-y-8 overflow-y-auto max-h-[calc(100vh-130px)] sm:max-h-[70vh] scrollbar-none">
          {" "}
          {/* Place Type segmented tab */}
          <div className="rounded-full border border-gray-300 dark:border-border p-1.5 bg-white dark:bg-muted/10 flex items-center w-full">
            <button
              type="button"
              onClick={() => setPlaceType("any")}
              className={`flex-grow py-4 text-center text-base font-black rounded-full transition-[background-color,color,transform] duration-160 ease-out active:scale-97 cursor-pointer ${
                placeType === "any"
                  ? "bg-purple-950 text-white shadow-sm dark:bg-purple-800"
                  : "text-purple-950 dark:text-purple-300 hover:bg-muted/30"
              }`}
            >
              Any type
            </button>{" "}
            <button
              type="button"
              onClick={() => setPlaceType("room")}
              className={`flex-grow py-3 text-center text-sm font-black rounded-[20px] transition-[background-color,color,transform] duration-160 ease-out active:scale-97 cursor-pointer ${
                placeType === "room"
                  ? "bg-purple-950 text-white shadow-sm dark:bg-purple-800"
                  : "text-purple-950 dark:text-purple-300 hover:bg-muted/30"
              }`}
            >
              Room
            </button>
            <button
              type="button"
              onClick={() => setPlaceType("entire")}
              className={`flex-grow py-3 text-center text-sm font-black rounded-[20px] transition-[background-color,color,transform] duration-160 ease-out active:scale-97 cursor-pointer ${
                placeType === "entire"
                  ? "bg-purple-950 text-white shadow-sm dark:bg-purple-800"
                  : "text-purple-950 dark:text-purple-300 hover:bg-muted/30"
              }`}
            >
              Entire home
            </button>
          </div>
          <div className="border-b border-border/50 pb-1" />
          {/* Price Range Slider */}
          <div className="space-y-4">
            <label className="text-sm font-black text-gray-800 dark:text-gray-200 tracking-tight block">
              Price range
            </label>

            {/* Standard double slider bar mockup */}
            <div className="relative py-2 select-none">
              <input
                type="range"
                min="50"
                max="3000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-650 focus:outline-none"
              />
            </div>

            {/* Minimum & Maximum inputs */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col items-start gap-1.5">
                <span className="text-xs font-black text-gray-500">Minimum</span>
                <div className="flex items-center justify-center border border-black dark:border-white rounded-xl px-4 py-1.5 bg-white dark:bg-muted/20">
                  <span className="text-sm font-black text-foreground">$</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-14 bg-transparent text-sm font-black text-foreground outline-none border-none p-0 focus:ring-0 text-center"
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-xs font-black text-gray-500">Maximum</span>
                <div className="flex items-center justify-center border border-black dark:border-white rounded-xl px-4 py-1.5 bg-white dark:bg-muted/20">
                  <span className="text-sm font-black text-foreground">$</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-16 bg-transparent text-sm font-black text-foreground outline-none border-none p-0 focus:ring-0 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-b border-border/50 pb-1" />
          {/* Counters Grid Section matching reference screenshot layout */}
          <div className="grid grid-cols-2 gap-x-10">
            {/* Column 1: Rooms and beds */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 tracking-tight">Rooms and beds</h3>
              <div className="space-y-1.5">
                {renderCounter("Bedrooms", bedrooms, setBedrooms, 1, 8)}
                {renderCounter("Beds", beds, setBeds, 1, 12)}
              </div>
            </div>

            {/* Column 2: People and pets */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 tracking-tight">People and pets</h3>
              <div className="space-y-1.5">
                {renderCounter("Adults", adults, setAdults, 1, 20)}
                {renderCounter("Children", children, setChildren, 1, 10)}
                {renderCounter("Pets", pets, setPets, 1, 5)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions aligned to design screenshot */}
        <div className="flex items-center justify-between border-t border-border/60 px-5 sm:px-8 py-4 sm:py-5 bg-card mt-auto sm:rounded-b-[32px] rounded-none">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-black text-foreground hover:text-purple-800 transition-colors cursor-pointer"
          >
            Clear all
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3.5 px-7 text-sm shadow-md transition-[transform,background-color] duration-160 ease-out active:scale-97 cursor-pointer"
          >
            Show all {filteredCount}+ places
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
