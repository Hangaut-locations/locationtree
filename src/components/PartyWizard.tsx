import {
  CalendarDays,
  HelpCircle,
  MapPin,
  Minus,
  PartyPopper,
  Plus,
  SaveAllIcon,
  Ticket,
  Type,
  Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Party_Types, SAMPLE_IMAGES } from "../data/constants";
import type { Listing } from "../types/listing";
import PartyStepThree from "./list-party/StepThree.party";
import PartyStepTwo from "./list-party/StepTwo.party";
import PartyStepFour from "./list-party/StepFour.party";

interface PartyWizardProps {
  onAddListing: (listing: Listing) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const PartyWizard: React.FC<PartyWizardProps> = ({ onAddListing }) => {
  const [step, setStep] = useState<WizardStep>(1);
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<string[]>([]);
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

  const isDateValid = !!startDate && !!endDate && endDate >= startDate;

  const handleNext = () => {
    if (step < 9) {
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
    const normalizedLocation = ([
      "Lekki",
      "Lagos",
      "surulere",
      "Uyo",
      "Enugu",
    ].find((loc) => loc.toLowerCase() === location.trim().toLowerCase()) ||
      "surulere") as "surulere" | "Enugu" | "Uyo" | "Lekki" | "Lagos";

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
    if (step === 3) return !!location;
    if (step === 4) return !!photos;
    if (step === 5) return price > 0;
    if (step === 6) return activities.trim().length > 0;
    if (step === 7) return rules.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 relative">
      {/* Wizard Header */}
      <header className="sticky top-0 z-45 w-full border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 md:px-8 flex items-center justify-between">
        <div
          className="flex items-center h-12 max-w-37.5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/images/logo.png"
            alt="Hangout Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Support line matches available agents.")}
            className="flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full border border-border sm:px-4 sm:py-2 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Questions?</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 md:py-2 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <SaveAllIcon className="h-4 w-4" />
            <span>Save & Exit</span>
          </button>
        </div>
      </header>

      {/* Progress Bar Indicator */}
      <div className="w-full bg-muted h-1 fixed z-10 top-20 right-0 left-0">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.45)] transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${(step / 12) * 100}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {/* Wizard Body Container */}
      <main className="grow flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
          {/* Step 1: Party type */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
              <div className="space-y-1.5">
                <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 1
                </span>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                  What type of party are you hosting?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose what fits best — house, beach, yacht, club and more.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Party_Types.map((item, index) => {
                  const isSelected = partyType === item.name;
                  return (
                    <button
                      key={index}
                      onClick={() => setPartyType(item.name)}
                      className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer active:scale-97 ${
                        isSelected
                          ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                          : "border-border/80 bg-card hover:border-gray-400"
                      }`}
                    >
                      <item.icon className="h-4 w-4 text-purple-950 dark:text-purple-300 shrink-0" />
                      <span className="text-xs font-semibold text-foreground capitalize">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Party dates */}
          {step === 2 && (
            <PartyStepTwo
              endDate={endDate}
              startDate={startDate}
              setEndDate={setEndDate}
              setStartDate={setStartDate}
            />
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <PartyStepThree location={location} setLocation={setLocation} />
          )}

          {step === 4 && (
            <PartyStepFour photos={photos} setPhotos={setPhotos} />
          )}

          {/* Step 5: Capacity + price */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
              <div className="space-y-1.5">
                <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 5
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                  Set your guest capacity and price
                </h2>
                <p className="text-xs text-muted-foreground">
                  Parties don't need bedrooms or beds — guests come for the
                  experience, not to sleep.
                </p>
              </div>

              <div className="max-w-md mx-auto">
                {renderCounter("Guest capacity", capacity, setCapacity)}
              </div>

              <div className="space-y-3">
                <p className="text-xs text-foreground">
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
                      <p className="text-sm font-semibold text-foreground">
                        Per person
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                      <p className="text-sm font-semibold text-foreground">
                        Per hour
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Guests book the whole party
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
                <span className="text-5xl font-semibold text-foreground">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-32 border-r border-border/60 bg-transparent text-center text-5xl font-semibold text-foreground outline-none"
                />
                <span className="text-sm font-semibold text-muted-foreground">
                  / {priceMode}
                </span>
              </div>
            </div>
          )}

          {/* Step 6: Activities */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
              <div className="space-y-1.5">
                <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 6
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                  What will be happening at the party?
                </h2>
                <p className="text-xs text-muted-foreground">
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

          {/* Step 7: Rules */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
              <div className="space-y-1.5">
                <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 7
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                  Set your party rules
                </h2>
                <p className="text-xs text-muted-foreground">
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

          {/* Step 8: Title + ticket */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
              <div className="space-y-1.5 w-full">
                <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 8
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                  Name your party
                </h2>
                <p className="text-xs text-muted-foreground">
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
                className="w-full mx-auto block border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl text-sm font-semibold text-foreground"
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
                  <p className="text-sm font-medium text-foreground">
                    Guests book / buy tickets for reservation
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ticket sales are required for this party. Turn off to allow
                    free RSVP.
                  </p>
                </div>
                <span
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-semibold ${
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

          {/* Step 9: Publish */}
          {step === 9 && (
            <div className="space-y-8 text-center">
              <div className="space-y-1.5">
                <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 9
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                  Set your final price for the party
                </h2>
                <p className="text-xs text-muted-foreground">
                  <span className="text-foreground">{partyType}</span> ·{" "}
                  {startDate} → {endDate} · {capacity} guests
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl sm:text-7xl font-semibold text-foreground">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-40 border-r border-border/60 bg-transparent text-center text-6xl sm:text-7xl font-semibold text-foreground outline-none"
                />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                per {priceMode}
              </p>

              <div className="max-w-md mx-auto rounded-3xl border border-border bg-card p-5 text-left space-y-2">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" /> Type
                  </span>
                  <span className="text-foreground">{partyType}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </span>
                  <span className="text-foreground">{location || "—"}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Capacity
                  </span>
                  <span className="text-foreground">{capacity} guests</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5" /> Booking
                  </span>
                  <span className="text-foreground">
                    {ticketed ? "Tickets required" : "Free RSVP"}
                  </span>
                </div>
              </div>

              {/* <button
                type="button"
                onClick={handleSubmit}
                className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-semibold py-3 px-8 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out cursor-pointer"
              >
                Publish party
              </button> */}
            </div>
          )}
        </div>
      </main>

      {/* Fixed Footer Actions bar */}
      <footer className="border-t border-border/60 bg-card py-5 px-6 sm:px-8 mt-auto z-20 sticky bottom-0 right-0 left-0">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-97 transition-[transform,background-color] duration-160 ease-out"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-semibold py-3 px-6 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {step === 9 ? "Publish" : "Next"}
          </button>
        </div>
      </footer>
    </div>
  );
};

const renderCounter = (
  label: string,
  value: number,
  onChange: (val: number) => void,
  min = 1,
) => {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-5">
      <span className="text-base font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-97 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-[transform,background-color] duration-160 ease-out"
        >
          <Minus className="h-4.5 w-4.5" />
        </button>
        <span className="w-5 text-center text-base font-semibold text-foreground">
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
