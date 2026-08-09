import {
  CalendarDays,
  HelpCircle,
  MapPin,
  Minus,
  PartyPopper,
  Plus,
  Ticket,
  Type,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PARTY_TYPES, SAMPLE_IMAGES } from "../data/constants";
import type { Listing } from "../types/listing";

interface PartyWizardProps {
  onAddListing: (listing: Listing) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const PartyWizard: React.FC<PartyWizardProps> = ({ onAddListing }) => {
  const [step, setStep] = useState<WizardStep>(1);
  const navigate = useNavigate();

  const [partyType, setPartyType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(10);
  const [priceMode, setPriceMode] = useState<"person" | "hour">("person");
  const [price, setPrice] = useState<number>(50);
  const [title, setTitle] = useState<string>("");
  const [activities, setActivities] = useState<string>("");
  const [rules, setRules] = useState<string>("");
  const [ticketed, setTicketed] = useState<boolean>(true);
  const [photos] = useState<string[]>(SAMPLE_IMAGES.slice(0, 2));

  const today = new Date().toISOString().split("T")[0];
  const isDateValid = !!startDate && !!endDate && endDate >= startDate;

  const handleNext = () => {
    if (step < 8) {
      setStep((prev) => (prev + 1) as WizardStep);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as WizardStep);
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to save and exit?"))
      navigate("/");
  };

  const handleSubmit = () => {
    const normalizedLocation = (["Lekki", "Lekki", "surulere"].find(
      (loc) => loc.toLowerCase() === location.trim().toLowerCase(),
    ) || "surulere") as "surulere";

    const finalTitle =
      title.trim() ||
      `${partyType} in ${normalizedLocation}${priceMode === "person" ? ` — ${capacity} guests` : ""}`;

    const newListing: Listing = {
      id: `party-listing-${Date.now()}`,
      title: finalTitle,
      location: normalizedLocation,
      category: partyType,
      images: photos,
      rating: 5.0,
      reviewsCount: 0,
      guestsCount: capacity,
      price,
      priceUnit: priceMode === "person" ? "person" : "hour",
      bedroomsCount: 0,
      bedsCount: 0,
      hostingType: "party",
      priceMode,
      partyType,
      startDate,
      endDate,
      activities,
      rules,
      description: activities,
      ticketed,
      isOwnedByUser: true,
    };

    onAddListing(newListing);
    alert(`Congratulations! Your ${partyType} is now live on Hangout.`);
    navigate("/");
  };

  const isStepValid = () => {
    if (step === 1) return !!partyType;
    if (step === 2) return isDateValid;
    if (step === 3)
      return ["Lekki", "Lekki", "surulere"].includes(
        location.trim().toLowerCase(),
      );
    if (step === 5) return activities.trim().length > 0;
    if (step === 8) return price > 0;
    return true;
  };

  const renderCounter = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    min = 1,
  ) => {
    return (
      <div className="flex items-center justify-between border-b border-border/40 py-5">
        <span className="text-base font-bold text-foreground">{label}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-97 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-[transform,background-color] duration-160 ease-out"
          >
            <Minus className="h-4.5 w-4.5" />
          </button>
          <span className="w-5 text-center text-base font-bold text-foreground">
            {value}
          </span>
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-97 cursor-pointer transition-[transform,background-color] duration-160 ease-out"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Wizard Header */}
      <header className="sticky top-0 z-45 w-full border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 md:px-8 flex items-center justify-between">
        <div
          className="flex items-center h-12 max-w-37.5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="logo.png"
            alt="Hangout Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Support line matches available agents.")}
            className="flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full border border-border sm:px-4 sm:py-2 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Questions?</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 md:py-2 text-xs md:text-sm font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <span>Save & Exit</span>
          </button>
        </div>
      </header>

      {/* Progress Bar Indicator */}
      <div className="w-full bg-muted h-1">
        <div
          className="bg-purple-950 dark:bg-purple-650 h-full transition-all duration-300"
          style={{ width: `${(step / 8) * 100}%` }}
        />
      </div>

      {/* Wizard Body Container */}
      <main className="grow flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
          {/* Step 1: Party type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 1
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  What type of party are you hosting?
                </h1>
                <p className="text-sm font-semibold text-muted-foreground">
                  Choose what fits best — house, beach, yacht, club and more.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PARTY_TYPES.map((type) => {
                  const isSelected = partyType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setPartyType(type)}
                      className={`flex items-center gap-2 rounded-2xl border px-4 py-3.5 text-left text-sm font-bold transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer active:scale-97 ${
                        isSelected
                          ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                          : "border-border/80 bg-card hover:border-gray-400"
                      }`}
                    >
                      <PartyPopper className="h-4 w-4 text-purple-950 dark:text-purple-300 shrink-0" />
                      <span className="text-xs font-bold text-foreground">
                        {type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Party dates */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 2
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  When is your party happening?
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Your party listing is cleared automatically after its end
                  date.
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center gap-3 border border-border/80 bg-card rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <label className="flex flex-col w-full">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Start date
                    </span>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0 cursor-pointer [color-scheme:light-dark]"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3 border border-border/80 bg-card rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <label className="flex flex-col w-full">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      End date
                    </span>
                    <input
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0 cursor-pointer [color-scheme:light-dark]"
                    />
                  </label>
                </div>
                {startDate && endDate && !isDateValid && (
                  <p className="text-center text-xs font-bold text-red-500">
                    End date must be after the start date.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 3
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Where is the party located?
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  The address is only shared with guests after they book a
                  ticket.
                </p>
              </div>
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <div className="flex items-center gap-3 border border-border/80 bg-card rounded-full px-5 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10 w-full">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Party location (e.g. Lekki, Paris, London)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Lekki", "Lekki", "surulere"].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        location.toLowerCase() === loc.toLowerCase()
                          ? "bg-purple-950 text-white border-purple-950 dark:bg-purple-800 dark:border-purple-800 shadow-sm"
                          : "bg-card text-foreground border-border hover:bg-muted hover:border-gray-400"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Capacity + price */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 4
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Set your guest capacity and price
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Parties don't need bedrooms or beds — guests come for the
                  experience, not to sleep.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                {renderCounter("Guest capacity", capacity, setCapacity)}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-foreground">
                  How do you want to charge?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriceMode("person")}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-4 text-left transition-all cursor-pointer active:scale-97 ${
                      priceMode === "person"
                        ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                        : "border-border/80 bg-card hover:border-gray-400"
                    }`}
                  >
                    <Users className="h-5 w-5 text-purple-950 dark:text-purple-300" />
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Per person
                      </p>
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Guests buy a ticket per seat
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceMode("hour")}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-4 text-left transition-all cursor-pointer active:scale-97 ${
                      priceMode === "hour"
                        ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                        : "border-border/80 bg-card hover:border-gray-400"
                    }`}
                  >
                    <CalendarDays className="h-5 w-5 text-purple-950 dark:text-purple-300" />
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Per hour
                      </p>
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Guests book the whole party
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
                <span className="text-5xl font-bold text-foreground">$</span>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-32 border-r border-border/60 bg-transparent text-center text-5xl font-bold text-foreground outline-none"
                />
                <span className="text-sm font-bold text-muted-foreground">
                  / {priceMode}
                </span>
              </div>
            </div>
          )}

          {/* Step 5: Activities */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 5
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  What will be happening at the party?
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Describe the vibe, music, activities and anything guests
                  should expect.
                </p>
              </div>
              <textarea
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                rows={5}
                placeholder="e.g. Live DJ from 9pm, rooftop barbecue, dance floor, games and more…"
                className="w-full min-h-44 resize-none border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl text-sm font-semibold text-foreground"
              />
            </div>
          )}

          {/* Step 6: Rules */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 6
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Set your party rules
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Keep it clear so guests know what's allowed (and what isn't).
                </p>
              </div>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={4}
                placeholder="e.g. No outside drinks, ID required at entry, smoking in designated areas…"
                className="w-full min-h-36 resize-none border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl text-sm font-semibold text-foreground"
              />
            </div>
          )}

          {/* Step 7: Title + ticket */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 7
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Name your party
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Pick something catchy — you can tweak it anytime from your
                  host profile.
                </p>
              </div>
              <input
                type="text"
                maxLength={48}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rooftop Sunset Beach Party"
                className="w-full max-w-lg mx-auto block border-2 border-foreground px-4 py-3.5 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl text-sm font-bold text-foreground"
              />
              <p className="text-right text-xs font-semibold text-muted-foreground">
                {title.length}/48
              </p>

              <button
                type="button"
                onClick={() => setTicketed((prev) => !prev)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-5 text-left transition-all cursor-pointer active:scale-97 ${
                  ticketed
                    ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                    : "border-border/80 bg-card hover:border-gray-400"
                }`}
              >
                <Ticket className="h-5 w-5 text-purple-950 dark:text-purple-300" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    Guests book / buy tickets for reservation
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Ticket sales are required for this party. Turn off to allow
                    free RSVP.
                  </p>
                </div>
                <span
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                    ticketed
                      ? "bg-purple-950 text-white border-purple-950"
                      : "border-border text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
            </div>
          )}

          {/* Step 8: Publish */}
          {step === 8 && (
            <div className="space-y-8 text-center">
              <div className="space-y-1.5">
                <span className="text-sm font-bold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 8
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Set your final price for the party
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  <span className="font-bold text-foreground">{partyType}</span>{" "}
                  · {startDate} → {endDate} · {capacity} guests
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl sm:text-7xl font-bold text-foreground">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-40 border-r border-border/60 bg-transparent text-center text-6xl sm:text-7xl font-bold text-foreground outline-none"
                />
              </div>
              <p className="text-sm font-bold text-muted-foreground">
                per {priceMode}
              </p>

              <div className="max-w-md mx-auto rounded-3xl border border-border bg-card p-5 text-left space-y-2">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" /> Type
                  </span>
                  <span className="text-foreground">{partyType}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </span>
                  <span className="text-foreground">{location || "—"}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Capacity
                  </span>
                  <span className="text-foreground">{capacity} guests</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5" /> Booking
                  </span>
                  <span className="text-foreground">
                    {ticketed ? "Tickets required" : "Free RSVP"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3 px-8 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out cursor-pointer"
              >
                Publish party
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Footer Actions bar */}
      <footer className="border-t border-border/60 bg-card py-5 px-6 sm:px-8 mt-auto">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-bold text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-97 transition-[transform,background-color] duration-160 ease-out"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3 px-6 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {step === 8 ? "Publish" : "Next"}
          </button>
        </div>
      </footer>
    </div>
  );
};
