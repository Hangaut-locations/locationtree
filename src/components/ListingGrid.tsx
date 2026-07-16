import React from 'react';
import type { Listing } from "../types/listing";
import { ListingCard } from './ListingCard';
import { Skeleton } from '../../components/ui/skeleton';
import { Compass, RefreshCw } from 'lucide-react';

interface ListingGridProps {
  listings: Listing[];
  isLoading: boolean;
  wishlist: string[];
  onWishlistToggle: (id: string) => void;
  onResetFilters: () => void;
  activeDestination: string;
  activeCategory: string;
  activeTab: 'location' | 'planning';
  onListingClick: (listing: Listing) => void;
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
}) => {
  // Check if any filter is active
  const isFiltering = activeDestination !== '' || activeCategory !== 'Rooftops';

  const isPlanning = activeTab === 'planning';

  // Group listings by location & tab contexts
  const parisListings = listings.filter((l) => l.location === 'Paris');
  const watfordListings = listings.filter((l) => l.location === 'Watford');
  const londonListings = listings.filter((l) => l.location === 'London');

  // Separated Paris lists for Planning Event vs Garden collections
  const parisEventListings = listings.filter(
    (l) => l.location === 'Paris' && !l.id.includes('garden')
  );
  const parisGardenListings = listings.filter(
    (l) => l.location === 'Paris' && l.id.includes('garden')
  );

  // Render skeleton loaders
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-8 space-y-12">
        {[1, 2].map((sectionIndex) => (
          <div key={sectionIndex} className="space-y-6">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((cardIndex) => (
                <div key={cardIndex} className="space-y-4 rounded-3xl border border-border p-4">
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
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-16 text-center flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-900/10 dark:bg-purple-300/15 text-purple-950 dark:text-purple-200 mb-6">
          <Compass className="h-8 w-8 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No listings found</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          We couldn't find any listings matching your search parameters. Try adjusting your destination, dates, guests count, or category.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-6 flex items-center gap-2 rounded-full bg-purple-950 dark:bg-purple-800 text-white font-semibold py-2.5 px-6 shadow-md hover:bg-purple-900 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset Filters</span>
        </button>
      </div>
    );
  }

  // Render listing row helper
  const renderListingRow = (title: string, items: Listing[]) => {
    if (items.length === 0) return null;
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-purple-950 dark:text-purple-300 tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              isWishlisted={wishlist.includes(item.id)}
              onWishlistToggle={onWishlistToggle}
              onListingClick={onListingClick}
            />
          ))}
        </div>
      </section>
    );
  };

  // Render duplicated rows helper
  const renderDuplicatedListingRow = (title: string, items: Listing[], repeatCount: number) => {
    if (items.length === 0) return null;
    return Array.from({ length: repeatCount }).map((_, index) => (
      <section key={`${title}-${index}`} className="space-y-6">
        <h2 className="text-2xl font-black text-purple-950 dark:text-purple-300 tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ListingCard
              key={`${item.id}-dup-${index}`}
              listing={item}
              isWishlisted={wishlist.includes(item.id)}
              onWishlistToggle={onWishlistToggle}
              onListingClick={onListingClick}
            />
          ))}
        </div>
      </section>
    ));
  };

  // If filtering, show standard rows without duplication to prevent clutter
  if (isFiltering) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-8 space-y-12">
        {isPlanning ? (
          <>
            {renderListingRow('Places in London', londonListings)}
            {renderListingRow('Locations Available in Paris', parisEventListings)}
            {renderListingRow('Location in Paris', parisGardenListings)}
          </>
        ) : (
          <>
            {renderListingRow('Locations Available in Paris', parisListings)}
            {renderListingRow('Homes in Watford', watfordListings)}
            {renderListingRow('Places in London', londonListings)}
          </>
        )}
      </div>
    );
  }

  // Default homepage view (no active filters) matching the mockup exactly
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-8 py-8 space-y-12">
      {isPlanning ? (
        <>
          {renderListingRow('Places in London', londonListings)}
          {renderListingRow('Locations Available in Paris', parisEventListings)}
          {renderDuplicatedListingRow('Location in Paris', parisGardenListings, 3)}
        </>
      ) : (
        <>
          {renderListingRow('Locations Available in Paris', parisListings)}
          {renderDuplicatedListingRow('Homes in Watford', watfordListings, 3)}
          {renderListingRow('Places in London', londonListings)}
        </>
      )}
    </div>
  );
};
