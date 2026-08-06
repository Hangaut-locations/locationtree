import { ArrowRight, Compass, DollarSign, RotateCcw, Sparkles, Users } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { locationListings as listingsData } from "../data/listings"
import type { Listing } from "../types/listing"
import { ListingCard } from "./ListingCard"

interface PlannerWizardProps {
  wishlist: string[]
  onWishlistToggle: (id: string) => void
}

interface EventType {
  id: string
  name: string
  emoji: string
  description: string
  suggestedCategories: string[]
}

const eventTypes: EventType[] = [
  {
    id: "birthday",
    name: "Birthday Party",
    emoji: "🎉",
    description: "Rooftops and amazing views to celebrate with style.",
    suggestedCategories: ["Rooftops", "Amazing Views"],
  },
  {
    id: "romantic",
    name: "Romantic Escape",
    emoji: "💖",
    description: "Charming cabins and beachfront spaces for two.",
    suggestedCategories: ["Cabin", "Beach front"],
  },
  {
    id: "corporate",
    name: "Corporate Retreat",
    emoji: "💼",
    description: "Large mansions and estates equipped for team building.",
    suggestedCategories: ["Mansions", "Amazing Views"],
  },
  {
    id: "family",
    name: "Family Gathering",
    emoji: "🏡",
    description: "Spacious properties with room for everyone to enjoy.",
    suggestedCategories: ["Cabin", "Tree House", "Castles"],
  },
  {
    id: "adventure",
    name: "Adventure Getaway",
    emoji: "🌲",
    description: "Unique treehouses and boat houses off the beaten track.",
    suggestedCategories: ["Tree House", "Houseboat", "Cabin"],
  },
]

export const PlannerWizard: React.FC<PlannerWizardProps> = ({ wishlist, onWishlistToggle }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [guestCount, setGuestCount] = useState(4)
  const [budget, setBudget] = useState(400)

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event)
    setStep(2)
  }

  const handleBackToEvents = () => {
    setStep(1)
  }

  const handleGeneratePlan = () => {
    setStep(3)
  }

  const handleRestart = () => {
    setSelectedEvent(null)
    setGuestCount(4)
    setBudget(400)
    setStep(1)
  }

  // Filter recommendations based on answers
  const recommendations: Listing[] = listingsData.filter((listing) => {
    // 1. Matches event category suggestions
    const categoryMatches = selectedEvent ? selectedEvent.suggestedCategories.includes(listing.category) : true

    // 2. Fits within guest capacity
    const capacityMatches = listing.guestsCount >= guestCount

    // 3. Under budget (max rate per hour / night)
    const budgetMatches = listing.price <= budget

    return categoryMatches && capacityMatches && budgetMatches
  })

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 animate-in fade-in duration-300">
      {/* Wizard Card Container */}
      <div className="w-full rounded-3xl border border-border bg-card shadow-lg p-4 sm:p-6 md:p-10 space-y-8">
        {/* Progress Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Event Planner Wizard</span>
            <h1 className="text-2xl md:text-3xl font-black text-purple-950 dark:text-purple-300 tracking-tight mt-1 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <span>Plan Your Experience</span>
            </h1>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? "w-8 bg-purple-950 dark:bg-purple-300"
                    : step > s
                      ? "w-2.5 bg-purple-600"
                      : "w-2.5 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Select Event Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-bold text-foreground">What kind of event are you planning?</h2>
              <p className="text-sm text-muted-foreground mt-1">Select an experience type to begin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventTypes.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleSelectEvent(event)}
                  className="flex flex-col items-start text-left p-4 sm:p-6 rounded-2xl border border-border bg-card cursor-pointer group planner-card hover:bg-muted/40"
                >
                  <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {event.emoji}
                  </span>
                  <h3 className="text-base font-bold text-purple-950 dark:text-purple-300">{event.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                  <span className="mt-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    <span>Select</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Preferences */}
        {step === 2 && selectedEvent && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Configure details for your {selectedEvent.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell us about guests and budget preferences.</p>
              </div>
              <button
                onClick={handleBackToEvents}
                className="text-xs font-bold uppercase tracking-wider text-purple-600 hover:underline cursor-pointer"
              >
                ← Back to events
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Guests Selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold uppercase tracking-wider text-purple-950 dark:text-purple-300 flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Guests Count
                  </label>
                  <span className="text-sm font-bold text-foreground bg-purple-900/10 dark:bg-purple-300/10 px-3 py-1 rounded-full">
                    {guestCount} guests
                  </span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                  <span className="text-xs text-muted-foreground flex-grow">Minimum capacity needed</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      disabled={guestCount <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card font-bold hover:bg-muted active:scale-97 transition-[transform,background-color] duration-160 ease-out disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-foreground">{guestCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestCount(Math.min(30, guestCount + 1))}
                      disabled={guestCount >= 30}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card font-bold hover:bg-muted active:scale-97 transition-[transform,background-color] duration-160 ease-out disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Budget slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold uppercase tracking-wider text-purple-950 dark:text-purple-300 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Max Rate (Hour / Night)
                  </label>
                  <span className="text-sm font-bold text-foreground bg-purple-900/10 dark:bg-purple-300/10 px-3 py-1 rounded-full">
                    ${budget}
                  </span>
                </div>
                <div className="space-y-2 py-2">
                  <input
                    type="range"
                    min="50"
                    max="1200"
                    step="25"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                    <span>$50</span>
                    <span>$600</span>
                    <span>$1200+</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleGeneratePlan}
                className="flex items-center gap-2 rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-semibold py-3 px-8 shadow-md hover:md:scale-105 active:scale-97 transition-[transform,background-color] duration-160 ease-out cursor-pointer"
              >
                <span>Generate Recommendations</span>
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Results / Recommendations */}
        {step === 3 && selectedEvent && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Recommendations for:</span>
                  <span className="bg-purple-900/10 dark:bg-purple-300/10 px-3 py-1 rounded-full text-purple-950 dark:text-purple-200">
                    {selectedEvent.name}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Found {recommendations.length} spaces matching: {guestCount}+ guests, up to ${budget}.
                </p>
              </div>
              <button
                onClick={handleRestart}
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-purple-600 hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restart wizard</span>
              </button>
            </div>

            {/* Recommendations Grid */}
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec, idx) => (
                  <ListingCard
                    key={rec.id}
                    listing={rec}
                    isWishlisted={wishlist.includes(rec.id)}
                    onWishlistToggle={onWishlistToggle}
                    index={idx}
                    currency="USD"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-900/10 dark:bg-purple-300/15 text-purple-950 dark:text-purple-200 mb-4">
                  <Compass className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No matches found</h3>
                <p className="text-muted-foreground mt-1.5 max-w-sm text-sm">
                  We couldn't find listings under ${budget} that fit {guestCount} guests inside the '
                  {selectedEvent.suggestedCategories.join(", ")}' categories.
                </p>
                <button
                  onClick={handleRestart}
                  className="mt-6 text-xs font-bold uppercase tracking-wider text-white bg-purple-950 hover:bg-purple-900 py-2.5 px-6 rounded-full transition-[transform,background-color] duration-160 ease-out active:scale-97 shadow cursor-pointer"
                >
                  Change criteria
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
