import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { type CurrencyCode, displayPrice, formatPrice } from "../lib/currency";
import type { Listing } from "../types/listing";

interface ListingCardProps {
  listing: Listing;
  isWishlisted: boolean;
  onWishlistToggle: (id: string) => void;
  onListingClick?: (listing: Listing) => void;
  index?: number;
  currency: CurrencyCode;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isWishlisted,
  onWishlistToggle,
  onListingClick,
  index,
  currency,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const prefersReduced = useReducedMotion();

  const transform = useTransform([rotateX, rotateY], ([rX, rY]) =>
    prefersReduced
      ? "none"
      : `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)`,
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIdx((prev) =>
      prev === 0 ? listing.images.length - 1 : prev - 1,
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIdx((prev) =>
      prev === listing.images.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div
      onClick={() => onListingClick?.(listing)}
      className="group relative flex flex-col rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm cursor-pointer card-interactive animate-listing-entrance"
      style={{
        animationDelay:
          index !== undefined ? `${Math.min(index * 30, 300)}ms` : "0ms",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="flex flex-col h-full w-full"
        style={{
          transform,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Image Carousel Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {/* Images */}
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIdx * 100}%)` }}
          >
            {listing.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${listing.title} - view ${index + 1}`}
                className="h-full w-full object-cover select-none card-image-zoom"
                loading="lazy"
              />
            ))}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onWishlistToggle(listing.id);
            }}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md text-foreground transition-[transform,background-color] duration-160 ease-out hover:bg-white dark:hover:bg-black/60 shadow-md active:scale-97 focus:outline-none cursor-pointer"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={`h-5 w-5 transition-[transform,colors] duration-200 ease-out ${
                isWishlisted
                  ? "fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            />
          </button>

          {/* Navigation Arrows (Visible on Hover / Always on mobile) */}
          {listing.images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className={`absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-foreground shadow-md transition-[transform,background-color,opacity] duration-160 ease-out hover:scale-105 active:scale-97 cursor-pointer ${
                  isHovered
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none"
                } md:block`}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={handleNext}
                className={`absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-sm text-foreground shadow-md transition-[transform,background-color,opacity] duration-160 ease-out hover:scale-105 active:scale-97 cursor-pointer ${
                  isHovered
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2 pointer-events-none"
                } md:block`}
                aria-label="Next image"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </>
          )}

          {/* Slide indicator dots */}
          {listing.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/30 px-2.5 py-1 backdrop-blur-sm">
              {listing.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentIdx(index);
                  }}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out cursor-pointer ${
                    currentIdx === index ? "w-3 bg-white" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="flex flex-1 flex-col p-5">
          {/* Rating and Reviews */}
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-foreground">{listing.rating.toFixed(1)}</span>
            <span className="text-muted-foreground font-medium">
              ({listing.reviewsCount})
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-2 text-base font-bold text-purple-950 dark:text-purple-300 line-clamp-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
            {listing.title}
          </h3>

          {/* Guests details */}
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {listing.guestsCount} guests
          </p>

          {/* Divider */}
          <div className="mt-4 mb-3 border-t border-border/40" />

          {/* Price and Action button */}
          <div className="flex items-baseline justify-between mt-auto">
            <div>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(displayPrice(listing.price, currency), currency)}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {" "}
                / {listing.priceUnit}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
