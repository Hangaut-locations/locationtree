import { HeartIcon, Star } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { displayPrice, formatPrice } from "../../lib/currency";
import type { IProperty } from "../../types/listing";
import useAuth from "../hooks/useAuth";
import useAppContext from "../hooks/useAppContext";
import { adminCaller } from "../../interceptors/http";
import CardImageCarousel from "../CardImageCarousel";
import { favoritesQueryKey, removeFavoriteByTarget } from "../../lib/favorites";

interface PropertyListCardProps {
  property: IProperty;
  index?: number;
}

export const PropertyListCard: React.FC<PropertyListCardProps> = ({
  property,
  index,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const qc = useQueryClient();
  const { setIsAuthModal, currency } = useAppContext();

  const handleFavorite = () => {
    if (!user) {
      setIsAuthModal(true);
      return;
    }

    setLoading(true);
    const request = property.isFavorite
      ? removeFavoriteByTarget(property._id)
      : adminCaller.post("/favorites", {
          targetId: property._id,
          targetType: "Property",
        });

    request
      .then(() =>
        Promise.all([
          qc.invalidateQueries({ queryKey: favoritesQueryKey }),
          qc.invalidateQueries({ queryKey: ["properties-grouped-by-location"] }),
        ]),
      )
      .finally(() => setLoading(false));
  };

  return (
    <div
      role="button"
      onClick={() => navigate(`/homes/${property._id}`)}
      className="rounded-xl group relative flex flex-col cursor-pointer"
      style={{
        animationDelay:
          index !== undefined ? `${Math.min(index * 30, 300)}ms` : "0ms",
      }}
    >
      <div className="relative w-full">
        <CardImageCarousel images={property.images} title={property.title} />

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleFavorite();
          }}
          disabled={loading}
          className="disabled:opacity-40 disabled:cursor-not-allowed absolute top-3 right-3 z-10 dark:bg-black/40 transition-[transform,background-color] duration-160 ease-out dark:hover:bg-black/60 hover:scale-110"
          aria-label={
            property.isFavorite ? "Remove from wishlist" : "Add to wishlist"
          }
        >
          <HeartIcon
            className={`cursor-pointer h-6 w-6 fill-gray-700 text-white transition-[transform,colors] duration-200 ease-out ${
              property.isFavorite
                ? "fill-red-500 text-red-500 scale-110 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                : "text-gray-700 dark:text-gray-300"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col py-1 gap-0.5 mt-1 pl-1">
        <p className="font-semibold text-left text-xs">{property.title}</p>
        <div className="w-full flex justify-start gap-1 items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <h1 className="font-medium">
              {formatPrice(displayPrice(Number(property.price), currency), currency)}
            </h1>
            <span className="text-muted-foreground">
              per {property.charge_type}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-2 w-2 fill-gray-500 text-gray-500" />
            <span className="text-foreground">1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
