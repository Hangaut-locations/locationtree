import { HelpCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Listing, PriceMode } from "../types/listing";
import StepOne from "./host-property/StepOne";
import StepTwo from "./host-property/StepTwo";
import StepThree from "./host-property/StepThree";
import StepFour from "./host-property/StepFour";
import StepFive from "./host-property/StepFive";
import StepSix from "./host-property/StepSix";
import StepSeven from "./host-property/StepSeven";
import StepEight from "./host-property/StepEight";
import StepNine from "./host-property/StepNine";
import StepTen from "./host-property/StepTen";
import StepEleven from "./host-property/StepEleven";
import StepTwelve from "./host-property/StepTwelve";

interface BecomeHostWizardProps {
  onAddListing: (newListing: Listing) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const BecomeHostWizard: React.FC<BecomeHostWizardProps> = ({
  onAddListing,
}) => {
  const [step, setStep] = useState<WizardStep>(1);
  const navigate = useNavigate();

  // Form States
  const [category, setCategory] = useState<string>("Rooftops");
  const [spaceType, setSpaceType] = useState<"entire" | "room" | "shared">(
    "entire",
  );
  const [location, setLocation] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [beds, setBeds] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [title, setTitle] = useState<string>("Charming rooftop retreat");
  const [description, setDescription] = useState<string>(
    "A stylish space designed for memorable stays, calm mornings, and easy hosting.",
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [bookingSetting, setBookingSetting] = useState<
    "approve-first" | "instant"
  >("approve-first");
  const [basePrice, setBasePrice] = useState<number>(75);
  const [priceMode, setPriceMode] = useState<PriceMode>("person");
  const [amenities, setAmenities] = useState<Set<string>>(new Set());

  const handleNext = () => {
    if (step < 12) {
      setStep((prev) => (prev + 1) as WizardStep);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to save and exit?")) {
      navigate("/");
    }
  };

  const handleSubmit = () => {
    // Normalize location to match valid listing locations
    const normalizedLocation = (["Lekki", "Surulere", "Lagos"].find(
      (loc) => loc.toLowerCase() === location.trim().toLowerCase(),
    ) || "Lagos") as "Lekki" | "Lagos" | "Surulere";

    // Mock create a new listing object
    const finalTitle = title.trim() || `Charming ${category} Stay`;

    const newListing: Listing = {
      id: `mock-listing-${Date.now()}`,
      title: finalTitle,
      location: normalizedLocation,
      price: basePrice, // was: 150 + Math.floor(Math.random() * 200)
      priceUnit: priceMode,
      rating: 5.0,
      reviewsCount: 1,
      images: photos.slice(0, 2),
      category: category,
      guestsCount: guests,
      bedroomsCount: bedrooms,
      bedsCount: beds,
      hostingType: "property",
      priceMode,
      description,
      amenities: [...amenities],
      isOwnedByUser: true,
    };

    onAddListing(newListing);
    alert("Congratulations! Your place is successfully listed on Hangout.");
    navigate("/");
  };

  // Check step validation
  const isStepValid = () => {
    if (step === 2) return !!category;
    if (step === 3) return !!spaceType;
    if (step === 4) {
      return !!location;
    }
    if (step === 7) return photos.length > 0;
    if (step === 8) return title.trim().length > 0;
    if (step === 9) return description.trim().length > 0;
    if (step === 12) return basePrice > 0;
    return true;
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-background text-foreground transition-colors duration-300">
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
            className="flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full border border-border sm:px-4 sm:py-2 text-xs font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Questions?</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 md:py-2 text-xs md:text-sm font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
          >
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
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Step 1: Introduction */}
          {step === 1 && <StepOne />}

          {/* Step 2: Category Selector */}
          {step === 2 && (
            <StepTwo category={category} setCategory={setCategory} />
          )}

          {/* Step 3: Space Type */}
          {step === 3 && (
            <StepThree spaceType={spaceType} setSpaceType={setSpaceType} />
          )}

          {/* Step 4: Location Map */}
          {step === 4 && (
            <StepFour location={location} setLocation={setLocation} />
          )}

          {/* Step 5: Basics */}
          {step === 5 && (
            <StepFive
              beds={beds}
              guests={guests}
              setBeds={setBeds as any}
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              setGuests={setGuests}
              setBedrooms={setBedrooms as any}
              setBathrooms={setBathrooms as any}
            />
          )}

          {/* Step 6: Amenities */}
          {step === 6 && (
            <StepSix amenities={amenities} setAmenities={setAmenities} />
          )}

          {/* Step 7: Add Photos */}
          {step === 7 && <StepSeven photos={photos} setPhotos={setPhotos} />}

          {/* Step 8: Title */}
          {step === 8 && <StepEight title={title} setTitle={setTitle} />}
          {/* Step 9: Description */}
          {step === 9 && (
            <StepNine
              description={description}
              setDescription={setDescription}
            />
          )}

          {/* Step 10: Finish Up Intro */}
          {step === 10 && <StepTen />}
          {/* Step 11: Booking Setting */}
          {step === 11 && (
            <StepEleven
              bookingSetting={bookingSetting}
              setBookingSetting={setBookingSetting}
            />
          )}

          {/* Step 12: Base Price & Publish (final step) */}
          {step === 12 && (
            <StepTwelve
              basePrice={basePrice}
              priceMode={priceMode}
              setBasePrice={setBasePrice}
              setPriceMode={setPriceMode}
            />
          )}
        </div>
      </main>

      {/* Fixed Footer Actions bar */}
      <footer className="border-t border-border/60 bg-card py-5 px-6 sm:px-8 mt-auto sticky right-0 bottom-0 left-0 z-10">
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
            {step === 12 ? "Publish" : "Next"}
          </button>{" "}
        </div>
      </footer>
    </div>
  );
};
