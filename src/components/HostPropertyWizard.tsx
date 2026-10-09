import { HelpCircle, SaveAllIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage, type ApiError } from "../lib/errors";
import type { IProperty, Listing, Visibility } from "../types/listing";
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
import { adminCaller, formClient } from "../interceptors/http";
import toast from "react-hot-toast";
import PartyTypeSkeleton from "./parties/CreatePartySkeleton";
import useRequireLogin from "./hooks/useRequireLogin";
import useAppContext from "./hooks/useAppContext";
import { priceForInput, priceToUSD } from "../lib/currency";

interface HostPropertyWizardProps {
  onAddListing?: (newListing: Listing) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const HostPropertyWizard: React.FC<HostPropertyWizardProps> = () => {
  useRequireLogin("/become-a-host");
  const [step, setStep] = useState<WizardStep>(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency } = useAppContext();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("p");

  const { data: propertyData, isLoading: propertyLoading } =
    useQuery<IProperty>({
      queryKey: ["property", propertyId],
      queryFn: () =>
        adminCaller
          .get(`/property/${propertyId}`)
          .then((res) => res.data?.data),
      enabled: !!propertyId,
      refetchOnWindowFocus: false,
    });

  // Form States
  const [category, setCategory] = useState<string>("");
  const [spaceType, setSpaceType] = useState<"entire" | "room" | "shared">(
    "entire",
  );
  const [location, setLocation] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [beds, setBeds] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [rules, setRules] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [bookingSetting, setBookingSetting] = useState<
    "approve-first" | "instant"
  >("approve-first");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [priceMode, setPriceMode] = useState<"person" | "hour">("person");
  const [amenities, setAmenities] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!propertyData) return;
    setCategory(propertyData.property_type ?? "");
    setSpaceType(propertyData.space_type ?? "entire");
    setLocation(propertyData.location ?? "");
    setGuests(Number(propertyData.guest_capacity) || 1);
    setBedrooms(Number(propertyData.bedrooms) || 0);
    setBeds(Number(propertyData.beds) || 0);
    setBathrooms(Number(propertyData.bathrooms) || 0);
    setTitle(propertyData.title ?? "");
    setDescription(propertyData.description ?? "");
    setRules(propertyData.property_rules ?? "");
    setPhotos(propertyData.images ?? []);
    setBookingSetting(
      propertyData.booking_setting === "instant" ? "instant" : "approve-first",
    );
    setVisibility(propertyData.visibility === "private" ? "private" : "public");
    setBasePrice(priceForInput(Number(propertyData.price) || 0, currency));
    setPriceMode(propertyData.charge_type === "hour" ? "hour" : "person");
    setAmenities(new Set(propertyData.amenities ?? []));

    if (propertyData.status === "draft") {
      // Steps that must be filled in, in order, so the host lands on the first unfinished one.
      const requiredSteps: [WizardStep, boolean][] = [
        [2, !!propertyData.property_type],
        [3, !!propertyData.space_type],
        [4, (propertyData.location ?? "").trim().length >= 3],
        [7, (propertyData.images?.length ?? 0) > 0],
        [8, !!propertyData.title?.trim()],
        [9, !!propertyData.description?.trim()],
        [12, Number(propertyData.price) > 0],
      ];
      const unfinished = requiredSteps.find(([, done]) => !done);
      setStep(unfinished ? unfinished[0] : 12);
    }
  }, [propertyData]);

  const canSaveDraft = !!category;
  const isDraft = propertyData?.status === "draft";

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

  const handleSubmit = (status: "published" | "draft" = "published") => {
    setLoading(true);

    // A draft may stop before these steps; the API refuses empty strings for them.
    const payload = {
      ...(title.trim() && { title: title.trim() }),
      ...(description.trim() && { description: description.trim() }),
      property_rules: rules.trim(),
      ...(location.trim() && { location }),
      images: photos,
      bedrooms,
      beds,
      bathrooms,
      guest_capacity: guests,
      price: priceToUSD(basePrice, currency),
      charge_type: priceMode,
      amenities: Array.from(amenities),
      property_type: category,
      space_type: spaceType,
      booking_setting: bookingSetting,
      visibility,
      status,
    };

    const request = propertyId
      ? formClient.patch(`/property/${propertyId}`, payload)
      : formClient.post("/property", payload);

    request
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["my-properties"] });
        queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
        toast.success(
          status === "draft"
            ? "Property saved as draft. Finish it anytime from My listings."
            : propertyId && !isDraft
              ? "Property updated successfully"
              : "Property published successfully",
        );
        navigate("/host?p=listings");
      })
      .catch((err: ApiError) => {
        toast.error(
          getErrorMessage(
            err,
            propertyId
              ? "Error updating property, try again!"
              : "Error creating property, try again!",
          ),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Check step validation
  const isStepValid = () => {
    if (step === 2) return !!category;
    if (step === 3) return !!spaceType;
    if (step === 4) return location.trim().length >= 3;
    if (step === 7) return photos.length > 0;
    if (step === 8) return title.trim().length > 0;
    if (step === 9) return description.trim().length > 0;
    if (step === 12) return basePrice > 0;
    return true;
  };

  if (propertyId && propertyLoading) {
    return <PartyTypeSkeleton />;
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Wizard Header */}
      <header className="sticky top-0 z-45 w-full border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 md:px-8 flex items-center justify-between">
        <div
          className="flex items-center h-12 max-w-37.5 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/logo.png"
            alt="Hangout Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Support line matches available agents.")}
            className="flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full border border-border sm:px-4 sm:py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Questions?</span>
          </button>
          <button
            title={
              canSaveDraft
                ? "Save property as draft"
                : "Pick a category first to save a draft"
            }
            disabled={!canSaveDraft || loading}
            onClick={() => handleSubmit("draft")}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 md:py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all cursor-pointer"
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
              rules={rules}
              setRules={setRules}
            />
          )}

          {/* Step 10: Finish Up Intro */}
          {step === 10 && <StepTen />}
          {/* Step 11: Booking Setting */}
          {step === 11 && (
            <StepEleven
              bookingSetting={bookingSetting}
              setBookingSetting={setBookingSetting}
              visibility={visibility}
              setVisibility={setVisibility}
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
            disabled={!isStepValid() || loading}
            className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3 px-6 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {step === 12
              ? loading
                ? propertyId && !isDraft
                  ? "Updating..."
                  : "Publishing..."
                : propertyId && !isDraft
                  ? "Update"
                  : "Publish"
              : "Next"}
          </button>
        </div>
      </footer>
    </div>
  );
};
