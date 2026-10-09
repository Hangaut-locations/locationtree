import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import useAppContext from "../components/hooks/useAppContext";
import HostCard from "../components/HostCard";
import ListingRules from "../components/ListingRules";
import MobileBookingBar from "../components/MobileBookingBar";
import PartyBookingForm from "../components/booking/PartyBookingForm";
import ShareModal from "../components/ShareModal";
import ImageViewer from "../components/ImageViewer";
import { adminCaller } from "../interceptors/http";
import { displayPrice, formatPrice } from "../lib/currency";
import { formatPartyWhen } from "../lib/partyTime";
import { isPrivateError, linkKey, listingLink } from "../lib/privateLink";
import type { TParty } from "../types/parties";

const scrollToBooking = () =>
  document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });

const PartyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useAppContext();
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const key = linkKey();
  const { data, isLoading, isError, error } = useQuery<TParty>({
    queryKey: ["party", id, key],
    enabled: Boolean(id),
    retry: (count, err) => !isPrivateError(err) && count < 3,
    queryFn: () =>
      adminCaller
        .get(`/parties/${id}`, { params: { key } })
        .then((response) => {
          return response.data?.data ?? response.data;
        }),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-6xl animate-pulse px-5 py-8 md:px-8">
          <div className="h-5 w-28 rounded bg-muted" />
          <div className="mt-8 h-105 rounded-[28px] bg-muted" />
          <div className="mt-8 h-8 w-2/3 rounded bg-muted" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !data) {
    return (
      <AppLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-5 text-center">
          <h1 className="text-2xl font-semibold">
            {isPrivateError(error)
              ? "This party is private"
              : "This party is unavailable"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isPrivateError(error)
              ? "Only people with the host's link can see it. Ask the host to send you the link."
              : "We could not load the details for this listing."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/parties")}
            className="mt-6 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background"
          >
            Back to parties
          </button>
        </div>
      </AppLayout>
    );
  }

  const images = data.images?.filter(Boolean) ?? [];
  const price = Number(data.price) || 0;
  const goToImage = (direction: number) => {
    setActiveImage((current) =>
      images.length ? (current + direction + images.length) % images.length : 0,
    );
  };

  return (
    <AppLayout>
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-6 md:px-8 md:pt-8 lg:pb-16">
        <div className="mb-7 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to parties
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button
              type="button"
              onClick={() => setIsSaved((saved) => !saved)}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Heart
                className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
              />
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <section className="relative grid h-72 grid-cols-1 gap-2 overflow-hidden rounded-3xl sm:h-96 md:h-107.5 md:grid-cols-[1.5fr_1fr_1fr] md:rounded-[28px]">
          <button
            type="button"
            onClick={() => setViewerIndex(activeImage)}
            className="relative min-h-70 cursor-zoom-in md:row-span-2"
            aria-label="Open photos full screen"
          >
            <img
              src={images[activeImage]}
              alt={data.title}
              className="h-full w-full object-cover"
            />
          </button>
          {images.slice(1, 5).map((image, index) => (
            <button
              type="button"
              key={image}
              onClick={() => setViewerIndex(index + 1)}
              className="hidden overflow-hidden md:block"
              aria-label={`View image ${index + 2}`}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </button>
          ))}
          {images.length > 1 && (
            <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between md:hidden">
              <button
                type="button"
                onClick={() => goToImage(-1)}
                className="rounded-full bg-white/90 p-2 shadow"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goToImage(1)}
                className="rounded-full bg-white/90 p-2 shadow"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="border-b border-border pb-7">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {data.location}
                </span>
                {data.party_type && (
                  <>
                    <span>·</span>
                    <span>{data.party_type}</span>
                  </>
                )}
                <span>·</span>
                <span>{data.charge_type} booking</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                {data.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {data.description}
              </p>
            </div>

            <HostCard host={data.host} />

            <div className="border-b border-border py-7">
              <h2 className="text-xl font-semibold">What this place offers</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  "Space for guests",
                  "Flexible booking",
                  "Party-ready setting",
                  "Host support",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <ListingRules title="Party rules" rules={data.party_rules} />

            <div className="py-7">
              <h2 className="text-xl font-semibold">Things to know</h2>
              <div className="mt-5 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                <p className="flex gap-3">
                  <Users className="h-5 w-5 shrink-0 text-foreground" /> Up to{" "}
                  {data.guest_capacity} guests
                </p>
                <p className="flex gap-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-foreground" />{" "}
                  {formatPartyWhen(data) || "Date to be announced"}
                </p>
                <p className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-foreground" />{" "}
                  Review the party rules before booking
                </p>
              </div>
            </div>
          </div>

          <aside id="book" className="scroll-mt-24 lg:relative">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold">
                  {formatPrice(displayPrice(price, currency), currency)}
                </span>
                <span className="text-sm text-muted-foreground">
                  per {data.charge_type}
                </span>
              </div>
              <PartyBookingForm party={data} />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You won't be charged yet
              </p>
              <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                {/* <div className="flex justify-between">
                  <span>Host rating</span>
                  <span className="font-semibold">4.9 / 5</span>
                </div> */}
                <div className="flex justify-between">
                  <span>Capacity</span>
                  <span className="font-semibold">
                    {data.guest_capacity} guests
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <MobileBookingBar
        price={formatPrice(displayPrice(price, currency), currency)}
        unit={data.charge_type}
        label="Book now"
        onBook={scrollToBooking}
      />
      <ImageViewer
        images={images}
        title={data.title}
        open={viewerIndex !== null}
        startIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
      <ShareModal
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        kind="party"
        title={data.title}
        image={images[0]}
        details={[formatPartyWhen(data), data.location].filter(Boolean).join(" · ")}
        url={listingLink("party", data._id, data.private_key ?? key)}
      />
    </AppLayout>
  );
};

export default PartyDetailPage;
