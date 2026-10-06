import { HeartIcon, Star } from "lucide-react";
import type React from "react";
import { displayPrice, formatPrice } from "../../lib/currency";
import type { TParty } from "../../types/parties";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAppContext from "../hooks/useAppContext";
import { adminCaller } from "../../interceptors/http";
import CardImageCarousel from "../CardImageCarousel";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  favoritesQueryKey,
  getFavorites,
  removeFavorite,
} from "../../lib/favorites";

interface PartyListCardProps {
  party: TParty;
  index?: number;
}

export const PartyListCard: React.FC<PartyListCardProps> = ({
  party,
  index,
}) => {
  const [loading, setLoading] = useState("");
  const navigate = useNavigate();
  const { data } = useAuth();
  const qc = useQueryClient();
  const { setIsAuthModal } = useAppContext();

  const handleFavorite = () => {
    if (data) {
      setLoading(party._id);

      const request = party?.isFavorite
        ? removeFavorite(party._id)
        : adminCaller.post("/favorites", {
            targetId: party._id,
            targetType: "Party",
          });

      request
        .then(() => qc.invalidateQueries({ queryKey: favoritesQueryKey }))
        .finally(() => setLoading(""));
      return;
    }

    setIsAuthModal(true);
  };

  return (
    <div
      role="button"
      onClick={() => navigate(`/parties/${party._id}`)}
      className="rounded-xl group relative flex flex-col animate-listing-entranc cursor-pointer"
      style={{
        animationDelay:
          index !== undefined ? `${Math.min(index * 30, 300)}ms` : "0ms",
      }}
    >
      <div>
        {/* Image Carousel Container */}
        <div className="relative w-full">
          <CardImageCarousel images={party.images} title={party.title} />

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleFavorite();
            }}
            disabled={loading === party?._id}
            className="disabled:opacity-40 disabled:cursor-not-allowed absolute top-3 right-3 z-10 dark:bg-black/40 transition-[transform,background-color] duration-160 ease-out dark:hover:bg-black/60 hover:scale-110"
            aria-label={
              party?.isFavorite ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <HeartIcon
              className={`cursor-pointer h-6 w-6 fill-gray-700 text-white transition-[transform,colors] duration-200 ease-out ${
                party?.isFavorite
                  ? "fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            />
          </button>
        </div>

        {/* Card Details */}
        <div className="flex flex-1 flex-col py-1 gap-0.5 mt-1 pl-1">
          {/* Title */}
          <p className="font-semibold text-left text-xs">{party.title}</p>

          <div className="w-full flex justify-start gap-1 items-center text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <h1 className="font-medium">
                {formatPrice(displayPrice(Number(party?.price), "USD"), "USD")}
              </h1>
              <span className="text-muted-foreground">
                per {party.charge_type}
              </span>
            </div>
            {/* Rating and Reviews */}
            <div className="flex items-center gap-1">
              <Star className="h-2 w-2 fill-gray-500 text-gray-500" />
              <span className="text-foreground">
                {(party?.rating || 1)?.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Guests details */}
          {/* <p className="mt-1 text-xs text-muted-foreground">
            {party.guest_capacity} guests
          </p> */}

          {/* Divider */}
          {/* <div className="mt-4 mb-3 border-t border-border/40" /> */}

          {/* Price and Action button */}
        </div>
      </div>
    </div>
  );
};
