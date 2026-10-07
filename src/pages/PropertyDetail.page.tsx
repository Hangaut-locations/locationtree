import {
  ArrowLeft,
  Bath,
  BedDouble,
  BedSingle,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Share2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import HostCard from "../components/HostCard";
import ListingRules from "../components/ListingRules";
import MobileBookingBar from "../components/MobileBookingBar";
import PropertyBookingForm from "../components/booking/PropertyBookingForm";
import useAuth from "../components/hooks/useAuth";
import useAppContext from "../components/hooks/useAppContext";
import { adminCaller } from "../interceptors/http";
import { displayPrice, formatPrice } from "../lib/currency";
import {
  favoritesQueryKey,
  getFavorites,
  isTargetFavorited,
  removeFavoriteByTarget,
} from "../lib/favorites";
import type { IProperty } from "../types/listing";

const SPACE_LABELS: Record<IProperty["space_type"], string> = {
  entire: "Entire place",
  room: "Private room",
  shared: "Shared space",
};

const scrollToBooking = () =>
  document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: user } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const [activeImage, setActiveImage] = useState(0);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isError } = useQuery<IProperty>({
    queryKey: ["property", id],
    enabled: Boolean(id),
    queryFn: () =>
      adminCaller.get(`/property/${id}`).then((response) => response.data?.data),
    retry: false,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: getFavorites,
    enabled: Boolean(user),
    refetchOnWindowFocus: false,
  });

  const isSaved = Boolean(id) && isTargetFavorited(favorites, id as string);

  const toggleSaved = () => {
    if (!user) {
      setIsAuthModal(true);
      return;
    }
    if (!id) return;

    setSaving(true);
    const request = isSaved
      ? removeFavoriteByTarget(id)
      : adminCaller.post("/favorites", { targetId: id, targetType: "Property" });

    request
      .then(() =>
        Promise.all([
          qc.invalidateQueries({ queryKey: favoritesQueryKey }),
          qc.invalidateQueries({ queryKey: ["properties-grouped-by-location"] }),
        ]),
      )
      .finally(() => setSaving(false));
  };

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
          <h1 className="text-2xl font-semibold">This home is unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been removed by the host.
          </p>
          <button
            type="button"
            onClick={() => navigate("/homes")}
            className="mt-6 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background"
          >
            Back to homes
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
        {data.status === "draft" && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This property is a draft. Only you can see it until you publish it
            from My listings.
          </div>
        )}

        <div className="mb-7 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to homes
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigator.clipboard?.writeText(window.location.href)
              }
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={toggleSaved}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
            >
              <Heart
                className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
              />
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <section className="relative grid h-72 grid-cols-1 gap-2 overflow-hidden rounded-3xl sm:h-96 md:h-107.5 md:grid-cols-[1.5fr_1fr_1fr] md:rounded-[28px]">
          <div className="relative min-h-70 md:row-span-2">
            <img
              src={images[activeImage]}
              alt={data.title}
              className="h-full w-full object-cover"
            />
          </div>
          {images.slice(1, 5).map((image, index) => (
            <button
              type="button"
              key={image}
              onClick={() => setActiveImage(index + 1)}
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
                <span>·</span>
                <span>{SPACE_LABELS[data.space_type] ?? data.space_type}</span>
                {data.property_type && (
                  <>
                    <span>·</span>
                    <span>{data.property_type}</span>
                  </>
                )}
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                {data.title}
              </h1>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {data.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border py-7 text-sm sm:grid-cols-4">
              <p className="flex items-center gap-2">
                <Users className="h-5 w-5" /> {data.guest_capacity} guests
              </p>
              <p className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" /> {data.bedrooms} bedrooms
              </p>
              <p className="flex items-center gap-2">
                <BedSingle className="h-5 w-5" /> {data.beds} beds
              </p>
              <p className="flex items-center gap-2">
                <Bath className="h-5 w-5" /> {data.bathrooms} bathrooms
              </p>
            </div>

            <HostCard host={data.host} />

            {data.amenities?.length > 0 && (
              <div className="border-b border-border py-7">
                <h2 className="text-xl font-semibold">What this place offers</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {data.amenities.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ListingRules title="House rules" rules={data.property_rules} />
          </div>

          <aside id="book" className="scroll-mt-24 lg:relative">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold">
                  {formatPrice(displayPrice(price, "USD"), "USD")}
                </span>
                <span className="text-sm text-muted-foreground">
                  per {data.charge_type}
                </span>
              </div>
              <PropertyBookingForm property={data} />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                You won't be charged yet
              </p>
              <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <span>Capacity</span>
                  <span className="font-semibold">
                    {data.guest_capacity} guests
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Booking</span>
                  <span className="font-semibold">
                    {data.booking_setting === "instant"
                      ? "Instant"
                      : "Host approves first"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <MobileBookingBar
        price={formatPrice(displayPrice(price, "USD"), "USD")}
        unit={data.charge_type}
        label={data.booking_setting === "instant" ? "Book now" : "Request to book"}
        onBook={scrollToBooking}
      />
    </AppLayout>
  );
};

export default PropertyDetailPage;
