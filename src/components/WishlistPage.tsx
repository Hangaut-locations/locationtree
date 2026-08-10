import { Heart } from "lucide-react";
import type React from "react";
import type { CurrencyCode } from "../lib/currency";
import type { Listing } from "../types/listing";
import { ListingCard } from "./ListingCard";

interface WishlistPageProps {
  listings: Listing[];
  wishlist: string[];
  onWishlistToggle: (id: string) => void;
  onListingClick: (listing: Listing) => void;
  currency: CurrencyCode;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  listings,
  wishlist,
  onWishlistToggle,
  onListingClick,
  currency,
}) => {
  const saved = listings.filter((l) => wishlist.includes(l.id));

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center">
          <Heart className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Wish / Loved list
        </h1>
      </div>

      {saved.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-14 text-center">
          <Heart className="h-9 w-9 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-bold text-foreground">
            Your wishlist is empty
          </p>
          <p className="text-sm font-semibold text-muted-foreground mt-1">
            Tap the heart on any party or property to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {saved.map((listing, idx) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isWishlisted
              onWishlistToggle={onWishlistToggle}
              onListingClick={onListingClick}
              index={idx}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
};
