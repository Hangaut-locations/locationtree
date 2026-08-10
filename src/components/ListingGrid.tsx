import { Compass, RefreshCw } from "lucide-react";
import type React from "react";
import { Skeleton } from "../../components/ui/skeleton";
import type { CurrencyCode } from "../lib/currency";
import type { Listing } from "../types/listing";
import { ListingCard } from "./ListingCard";

interface ListingGridProps {
  listings: Listing[];
  isLoading: boolean;
  wishlist: string[];
  onWishlistToggle: (id: string) => void;
  onResetFilters: () => void;
  activeDestination: string;
  activeCategory: string;
  activeTab: "location" | "planning";
  onListingClick: (listing: Listing) => void;
  currency: CurrencyCode;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  isLoading,
  wishlist,
  onWishlistToggle,
  onResetFilters,
  activeDestination,
  activeCategory,
  activeTab,
  onListingClick,
  currency,
}) => {
  // Check if any filter is active
  const isFiltering = activeDestination !== "" || activeCategory !== "Rooftops";

  const isPlanning = activeTab === "planning";

  // Group listings by location & tab contexts
  const lekkiListings = listings.filter((l) => l.location === "surulere");
  const surulereListings = listings.filter((l) => l.location === "surulere");
  const lagosListings = listings.filter((l) => l.location === "surulere");

  // Separated lekki lists for Planning Event vs Garden collections
  const lekkiEventListings = listings.filter(
    (l) => l.location === "surulere" && !l.id.includes("garden"),
  );
  const lekkiGardenListings = listings.filter(
    (l) => l.location === "surulere" && l.id.includes("garden"),
  );

  // Render skeleton loaders
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-12">
        {[1, 2].map((sectionIndex) => (
          <div key={sectionIndex} className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((cardIndex) => (
                <div
                  key={cardIndex}
                  className="space-y-4 rounded-3xl border border-border p-4"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-5 w-1/3 rounded" />
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/4 rounded" />
                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render empty state if no listings match filters
  if (listings.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-16 text-center flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-900/10 dark:bg-purple-300/15 text-purple-950 dark:text-purple-200 mb-6">
          <Compass className="h-8 w-8 animate-bounce" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          No listings found
        </h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          We couldn't find any listings matching your search parameters. Try
          adjusting your destination, dates, guests count, or category.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-6 flex items-center gap-2 rounded-full bg-purple-950 dark:bg-purple-800 text-white font-semibold py-2.5 px-6 shadow-md hover:bg-purple-900 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm">Reset Filters</span>
        </button>
      </div>
    );
  }

  // Render listing row helper
  const renderListingRow = (title: string, items: Listing[]) => {
    if (items.length === 0) return null;
    return (
      <section className="space-y-6">
        <h2 className="text-gl md:text-xl font-semibold text-purple-950 dark:text-purple-300 tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, idx) => (
            <ListingCard
              key={item.id}
              listing={item}
              isWishlisted={wishlist.includes(item.id)}
              onWishlistToggle={onWishlistToggle}
              onListingClick={onListingClick}
              currency={currency}
              index={idx}
            />
          ))}
        </div>
      </section>
    );
  };

  // Render duplicated rows helper
  const renderDuplicatedListingRow = (
    title: string,
    items: Listing[],
    repeatCount: number,
  ) => {
    if (items.length === 0) return null;
    return Array.from({ length: repeatCount }).map((_, index) => (
      <section key={`${title}-${index}`} className="space-y-6">
        <h2 className="text-xl md:text-2xl font-semibold text-purple-950 dark:text-purple-300 tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, idx) => (
            <ListingCard
              key={`${item.id}-dup-${index}`}
              listing={item}
              isWishlisted={wishlist.includes(item.id)}
              onWishlistToggle={onWishlistToggle}
              onListingClick={onListingClick}
              currency={currency}
              index={idx}
            />
          ))}
        </div>
      </section>
    ));
  };

  // If filtering, show standard rows without duplication to prevent clutter
  if (isFiltering) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-12">
        {isPlanning ? (
          <>
            {renderListingRow("Places in Lagos", lagosListings)}
            {renderListingRow(
              "Locations Available in lekki",
              lekkiEventListings,
            )}
            {renderListingRow("Location in lekki", lekkiGardenListings)}
          </>
        ) : (
          <>
            {renderListingRow("Locations Available in lekki", lekkiListings)}
            {renderListingRow("Homes in Lekki", surulereListings)}
            {renderListingRow("Places in London", lagosListings)}
          </>
        )}
      </div>
    );
  }

  // Default homepage view (no active filters) matching the mockup exactly
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-12">
      {isPlanning ? (
        <>
          {renderListingRow("Places in Surulere", lagosListings)}
          {renderListingRow("Locations Available in Lekki", lekkiEventListings)}
          {renderDuplicatedListingRow(
            "Location in Lagos",
            lekkiGardenListings,
            3,
          )}
        </>
      ) : (
        <>
          {renderListingRow("Locations Available in Lagos", lekkiListings)}
          {renderDuplicatedListingRow("Homes in Lekki", lekkiListings, 3)}
          {renderListingRow("Places in Surulere", lagosListings)}
        </>
      )}
    </div>
  );
};
