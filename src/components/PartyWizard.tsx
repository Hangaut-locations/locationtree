import {
  CalendarDays,
  Clock,
  Eye,
  HelpCircle,
  MapPin,
  Minus,
  Plus,
  SaveAllIcon,
  Ticket,
  Type,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Party_Types } from "../data/constants";
import PartyStepThree from "./list-party/StepThree.party";
import PartyStepTwo from "./list-party/StepTwo.party";
import PartyStepFour from "./list-party/StepFour.party";
import { adminCaller, formClient } from "../interceptors/http";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PartyTypeSkeleton from "./parties/CreatePartySkeleton";
import type { TParty } from "../types/parties";
import { getErrorMessage, type ApiError } from "../lib/errors";
import { formatPartyWhen, toDateInput } from "../lib/partyTime";
import useRequireLogin from "./hooks/useRequireLogin";
import useAppContext from "./hooks/useAppContext";
import useListingMedia from "./hooks/useListingMedia";
import { priceForInput, priceToUSD, symbolFor } from "../lib/currency";
import PriceInput from "./PriceInput";
import type { Visibility } from "../types/listing";
import VisibilityChoice from "./VisibilityChoice";

interface PartyWizardProps {
  // onAddListing: (listing: Listing) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const PRICE_MODES = [
  {
    id: "person",
    icon: Users,
    title: "Per person",
    text: "Guests buy a ticket per seat",
  },
  {
    id: "hour",
    icon: Clock,
    title: "Per hour",
    text: "Guests book the whole party",
  },
  {
    id: "day",
    icon: CalendarDays,
    title: "Per day",
    text: "Guests book the whole party by the day",
  },
] as const;

type PriceMode = (typeof PRICE_MODES)[number]["id"];

const cleanMoney = (raw: string) =>
  raw
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1")
    .replace(/^0+(?=\d)/, "");

/** Price box for one extra ticket. Shows the currency, and drops a leading zero. */
const TicketPriceField = ({
  value,
  symbol,
  onChange,
}: {
  value: number;
  symbol: string;
  onChange: (next: number) => void;
}) => {
  const [text, setText] = useState(() => (value > 0 ? String(value) : ""));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if ((Number(text) || 0) !== value) setText(value > 0 ? String(value) : "");
  }
  return (
    <label className="block min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Price
      </span>
      <span className="mt-1 flex min-w-0 items-center gap-1 rounded-xl border border-border px-3 py-2">
        <span className="shrink-0 text-sm font-semibold text-foreground">
          {symbol}
        </span>
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          aria-label="Ticket price"
          value={text}
          onChange={(e) => {
            const next = cleanMoney(e.target.value);
            setText(next);
            onChange(Number(next) || 0);
          }}
          className="min-w-0 w-full bg-transparent text-sm outline-none"
        />
      </span>
    </label>
  );
};

/** How many of one ticket. The box can be cleared, so a single digit other than 1 can be typed. */
const TicketCountField = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) => {
  const [text, setText] = useState(() => String(value));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (text !== "" && (Number(text) || 0) !== value) setText(String(value));
  }
  return (
    <label className="block min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        How many
      </span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="How many of this ticket"
        value={text}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
          setText(digits);
          if (digits === "") return;
          onChange(Number(digits));
        }}
        onBlur={() => {
          const next = Math.max(1, Number(text) || 1);
          setText(String(next));
          onChange(next);
        }}
        className="mt-1 w-full min-w-0 rounded-xl border border-border px-3 py-2 text-sm outline-none"
      />
    </label>
  );
};

export const PartyWizard: React.FC<PartyWizardProps> = () => {
  useRequireLogin("/become-a-host");
  const [step, setStep] = useState<WizardStep>(1);
  const navigate = useNavigate();
  const { currency } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [ddrafting, setDrafting] = useState(false);
  const media = useListingMedia("party");
  const { photos, setPhotos, setVideo } = media;
  const [partyType, setPartyType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(10);
  const [priceMode, setPriceMode] = useState<PriceMode>("person");
  const [price, setPrice] = useState<number>(() =>
    priceForInput(50, currency),
  );
  const [title, setTitle] = useState<string>("");
  const [activities, setActivities] = useState<string>("");
  const [rules, setRules] = useState<string>("");
  const [is_ticket_sales, setIsTicketsales] = useState<boolean>(true);
  const [ticketOptions, setTicketOptions] = useState<
    { name: string; price: number; available: number; details: string }[]
  >([]);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const searchParams = new URLSearchParams(window.location.search);
  const partyId = searchParams.get("p");
  const queryClient = useQueryClient();

  const { data: partyData, isLoading } = useQuery<TParty>({
    queryKey: ["party", partyId],
    queryFn: async () =>
      await adminCaller
        .get(`/parties/${partyId}`)
        .then((res) => res.data?.data),
    enabled: !!partyId,
  });

  // console.log("partyData", partyData);

  const isDateValid =
    !!startDate && !!endDate && endDate >= startDate && !!startTime;

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

  const handleSubmit = (status: "published" | "draft" = "published") => {
    setLoading(true);

    const namedTickets = is_ticket_sales
      ? ticketOptions
          .filter((option) => option.name.trim())
          .map((option) => ({
            name: option.name.trim(),
            price: priceToUSD(option.price, currency),
            available: option.available,
            details: option.details.trim(),
          }))
      : [];
    const sendTickets =
      namedTickets.length > 0 || (partyData?.ticket_options?.length ?? 0) > 0;
    const payload = {
      ...(title && { title: title.trim() }),
      ...(activities && { description: activities.trim() }),
      ...(location && { location }),
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      ...(capacity && { guest_capacity: capacity }),
      price: priceToUSD(is_ticket_sales ? price : 0, currency),
      ...(priceMode && { charge_type: priceMode }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(startTime && { start_time: startTime }),
      ...(rules && { party_rules: rules.trim() }),
      is_ticket_sales: is_ticket_sales ? "true" : "false",
      ...(sendTickets && { ticket_options: JSON.stringify(namedTickets) }),
      visibility,
      ...(partyType && { party_type: partyType }),
      ...(photos.length > 0 && { images: photos }),
      video: media.video?.public_id ?? "",
      status,
    };

    // Editing must update the same party, not create a new one.
    const request = partyId
      ? formClient.patch(`/parties/${partyId}`, payload)
      : formClient.post("/parties", payload);

    request
      .then(() => {
        toast.success(
          status === "draft"
            ? "Party saved as draft. Finish it anytime from My listings."
            : partyId && !isDraft
              ? "Party updated successfully"
              : "Party published successfully",
        );
        if (status === "published" && visibility === "private") {
          toast("Use the link button in My listings to copy the private link for your guests.");
        }
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["my-parties"] });
        queryClient.invalidateQueries({
          queryKey: ["parties-grouped-by-location"],
        });
        navigate("/host?p=listings");
      })
      .catch((err: ApiError) => {
        toast.error(
          getErrorMessage(
            err,
            partyId
              ? "Couldn't update the party, try again."
              : "Couldn't create the party, try again.",
          ),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const isStepValid = () => {
    if (step === 1) return !!partyType;
    if (step === 2) return isDateValid;
    if (step === 3) return (location || "").trim().length >= 3;
    if (step === 4) return photos.length > 0;
    if (step === 5) return true;
    if (step === 6) return activities.trim().length > 0;
    if (step === 7) return rules.trim().length > 0;
    if (step === 8) return !!title;
    if (step === 9) {
      if (!is_ticket_sales) return true;
      const named = ticketOptions.filter((option) => option.name.trim());
      const keys = named.map((option) => option.name.trim().toLowerCase());
      const unique = new Set(keys).size === keys.length;
      const sized = named.every(
        (option) => option.available >= 1 && option.available <= capacity,
      );
      return price > 0 && unique && sized;
    }
    return true;
  };

  useEffect(() => {
    if (partyData) {
      setTitle(partyData.title ?? "");
      setStartDate(toDateInput(partyData.start_date));
      setEndDate(toDateInput(partyData.end_date));
      setStartTime(partyData.start_time ?? "");
      setPartyType(partyData.party_type ?? "");
      setLocation(partyData.location ?? "");
      setPhotos(partyData.images ?? []);
      setVideo(partyData.video ?? null);
      setPrice(priceForInput(Number(partyData.price) || 0, currency));
      setPriceMode(partyData.charge_type ?? "person");
      setCapacity(Number(partyData.guest_capacity) || 10);
      setIsTicketsales(String(partyData.is_ticket_sales) !== "false");
      setTicketOptions(
        (partyData.ticket_options ?? []).map((option) => ({
          name: option.name,
          price: priceForInput(Number(option.price) || 0, currency),
          available: option.available,
          details: option.details ?? "",
        })),
      );
      setVisibility(partyData.visibility === "private" ? "private" : "public");
      setActivities(partyData.description ?? "");
      setRules(partyData.party_rules ?? "");

      if (partyData.status === "draft") {
        // Same order as the steps, so the host lands on the first unfinished one.
        const stepDone = [
          !!partyData.party_type,
          !!partyData.start_date && !!partyData.end_date && !!partyData.start_time,
          (partyData.location ?? "").trim().length >= 3,
          (partyData.images?.length ?? 0) > 0,
          Number(partyData.price) > 0,
          !!partyData.description?.trim(),
          !!partyData.party_rules?.trim(),
          !!partyData.title?.trim(),
        ];
        const firstUnfinished = stepDone.indexOf(false);
        setStep((firstUnfinished === -1 ? 9 : firstUnfinished + 1) as WizardStep);
      }
    }
  }, [partyData]);

  const isDraft = partyData?.status === "draft";

  if (partyId && isLoading) {
    return <PartyTypeSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 relative">
      {/* Wizard Header */}
      <header className="sticky top-0 z-45 w-full border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 md:px-8 flex items-center justify-between">
        <div
          className="flex items-center h-12 max-w-37.5 cursor-pointer"
          onClick={() => navigate("/host?p=listings")}
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
            className="flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full border border-border sm:px-4 sm:py-2 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Questions?</span>
          </button>
          <button
            title={
              media.busy
                ? "Wait for your uploads to finish"
                : partyType
                  ? "Save party as draft"
                  : "Pick a party type first to save a draft"
            }
            disabled={!partyType || loading || media.busy}
            onClick={() => handleSubmit("draft")}
            className="disabled:opacity-55 disabled:cursor-not-allowed flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 md:py-2 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <SaveAllIcon className="h-4 w-4" />
            <span>Save & Exit</span>
          </button>
        </div>
      </header>

      {/* Progress Bar Indicator */}
      <div className="w-full bg-muted h-1 fixed z-10 top-20 right-0 left-0">
        <div
          className="h-full rounded-full bg-linear-to-r from-violet-600 via-purple-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.45)] transition-all duration-500 ease-out relative overflow-hidden"
          style={{ width: `${(step / 12) * 100}%` }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" />
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
              startTime={startTime}
              setEndDate={setEndDate}
              setStartDate={setStartDate}
              setStartTime={setStartTime}
            />
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <PartyStepThree location={location} setLocation={setLocation} />
          )}

          {step === 4 && (
            <PartyStepFour media={media} />
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {PRICE_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPriceMode(mode.id)}
                      className={`flex items-center gap-2 rounded-2xl border px-4 py-4 text-left transition-all cursor-pointer active:scale-97 ${
                        priceMode === mode.id
                          ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                          : "border-border/80 bg-card hover:border-gray-400"
                      }`}
                    >
                      <mode.icon className="h-5 w-5 shrink-0 text-purple-950 dark:text-purple-300" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {mode.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mode.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
                <span className="text-5xl font-semibold text-foreground">
                  {symbolFor(currency)}
                </span>
                <PriceInput
                  value={price}
                  onChange={setPrice}
                  className="text-5xl font-semibold"
                />
                <span className="text-sm font-semibold text-muted-foreground">
                  / {priceMode}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave this at 0 if guests will reserve for free. You confirm
                that when you name the party.
              </p>
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
                onClick={() => setIsTicketsales(true)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-5 text-left transition-all cursor-pointer active:scale-97 ${
                  is_ticket_sales
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
                    Guests pay the price you set on the next step.
                  </p>
                </div>
                <span
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-semibold ${
                    is_ticket_sales
                      ? "bg-purple-950 text-white border-purple-950"
                      : "border-border text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTicketsales(false);
                  setPrice(0);
                }}
                className={`w-full flex items-center gap-3 rounded-2xl border p-5 text-left transition-all cursor-pointer active:scale-97 ${
                  is_ticket_sales
                    ? "border-border/80 bg-card hover:border-gray-400"
                    : "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/15"
                }`}
              >
                <Ticket className="h-5 w-5 text-purple-950 dark:text-purple-300" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Reserve without a ticket
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Guests book a free spot and still get a code by email.
                  </p>
                </div>
                <span
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-semibold ${
                    is_ticket_sales
                      ? "border-border text-transparent"
                      : "bg-purple-950 text-white border-purple-950"
                  }`}
                >
                  ✓
                </span>
              </button>

              <VisibilityChoice
                kind="party"
                value={visibility}
                onChange={setVisibility}
              />
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
                  {formatPartyWhen({
                    start_date: startDate,
                    end_date: endDate,
                    start_time: startTime,
                  })}{" "}
                  · {capacity} guests
                </p>
              </div>

              {is_ticket_sales ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-6xl sm:text-7xl font-semibold text-foreground">
                    {symbolFor(currency)}
                  </span>
                  <PriceInput
                    value={price}
                    onChange={setPrice}
                    className="text-6xl sm:text-7xl font-semibold"
                  />
                </div>
              ) : (
                <p className="text-6xl sm:text-7xl font-semibold text-foreground">
                  {symbolFor(currency)}0
                </p>
              )}
              <p className="text-sm font-semibold text-muted-foreground">
                {is_ticket_sales
                  ? `per ${priceMode}`
                  : `Free for guests. This publishes at ${symbolFor(currency)}0.`}
              </p>
              {!is_ticket_sales && (
                <button
                  type="button"
                  onClick={() => setIsTicketsales(true)}
                  className="text-sm font-semibold text-purple-950 underline"
                >
                  Sell tickets instead
                </button>
              )}

              {is_ticket_sales && (
                <div className="mx-auto w-full min-w-0 max-w-md space-y-3 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      More tickets
                    </p>
                    <button
                      type="button"
                      disabled={ticketOptions.length >= 6}
                      onClick={() =>
                        setTicketOptions((current) => [
                          ...current,
                          { name: "", price, available: Math.min(10, capacity), details: "" },
                        ])
                      }
                      className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add a ticket
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Name it, set a price, how many you want to sell, and what it
                    includes. Guests can still buy the main ticket above.
                  </p>
                  {ticketOptions.some((option) => option.name.trim()) &&
                    (() => {
                      const named = ticketOptions.filter((option) =>
                        option.name.trim(),
                      );
                      const keys = named.map((option) =>
                        option.name.trim().toLowerCase(),
                      );
                      const bad =
                        new Set(keys).size !== keys.length ||
                        named.some((option) => option.available > capacity);
                      return bad ? (
                        <p className="text-xs font-semibold text-red-500">
                          Each ticket needs its own name, and how many can't be
                          more than your guest total.
                        </p>
                      ) : null;
                    })()}
                  {ticketOptions.map((option, index) => (
                    <div
                      key={index}
                      className="w-full min-w-0 rounded-2xl border border-border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={40}
                          value={option.name}
                          placeholder="Ticket name, e.g. VIP"
                          aria-label="Ticket name"
                          onChange={(e) =>
                            setTicketOptions((current) =>
                              current.map((row, i) =>
                                i === index ? { ...row, name: e.target.value } : row,
                              ),
                            )
                          }
                          className="min-w-0 flex-1 rounded-xl border border-border px-3 py-2 text-sm outline-none"
                        />
                        <button
                          type="button"
                          aria-label="Remove ticket"
                          onClick={() =>
                            setTicketOptions((current) =>
                              current.filter((_, i) => i !== index),
                            )
                          }
                          className="shrink-0 rounded-xl border border-border p-2"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        maxLength={280}
                        rows={3}
                        value={option.details}
                        placeholder="What this ticket includes"
                        aria-label="What this ticket includes"
                        onChange={(e) =>
                          setTicketOptions((current) =>
                            current.map((row, i) =>
                              i === index ? { ...row, details: e.target.value } : row,
                            ),
                          )
                        }
                        className="mt-2 w-full resize-none rounded-xl border border-border px-3 py-2 text-sm outline-none"
                      />
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <TicketPriceField
                          value={option.price}
                          symbol={symbolFor(currency)}
                          onChange={(next) =>
                            setTicketOptions((current) =>
                              current.map((row, i) =>
                                i === index ? { ...row, price: next } : row,
                              ),
                            )
                          }
                        />
                        <TicketCountField
                          value={option.available}
                          onChange={(next) =>
                            setTicketOptions((current) =>
                              current.map((row, i) =>
                                i === index ? { ...row, available: next } : row,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                {ticketOptions
                  .filter((option) => option.name.trim())
                  .map((option, index) => (
                    <div key={`${option.name}-${index}`} className="text-xs font-semibold text-muted-foreground">
                      <div className="flex justify-between gap-3">
                        <span className="min-w-0 truncate text-foreground">
                          {option.name.trim()}
                        </span>
                        <span className="shrink-0 text-foreground">
                          {symbolFor(currency)}
                          {option.price} · {option.available}
                        </span>
                      </div>
                      {option.details.trim() && (
                        <p className="mt-0.5 font-normal">{option.details.trim()}</p>
                      )}
                    </div>
                  ))}
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5" /> Booking
                  </span>
                  <span className="text-foreground">
                    {is_ticket_sales ? "Tickets required" : "Free RSVP"}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Who can see it
                  </span>
                  <span className="text-foreground">
                    {visibility === "private"
                      ? "Private, link only"
                      : "Public"}
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
            disabled={!isStepValid() || loading || (step === 9 && media.busy)}
            className="rounded-full ease disabled:cursor-not-allowed bg-purple-950 disabled:opacity-55 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-semibold py-3 px-6 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out disabled:pointer-events-none cursor-pointer"
          >
            {step === 9 && media.busy
              ? "Uploading..."
              : step === 9
              ? loading
                ? partyData && !isDraft
                  ? "Updating..."
                  : "Publishing..."
                : partyData && !isDraft
                  ? "Update"
                  : "Publish"
              : "Next"}
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
