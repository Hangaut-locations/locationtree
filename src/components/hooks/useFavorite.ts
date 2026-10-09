import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCaller } from "../../interceptors/http";
import {
  favoritesQueryKey,
  getFavorites,
  isTargetFavorited,
  removeFavoriteByTarget,
} from "../../lib/favorites";
import useAppContext from "./useAppContext";
import useAuth from "./useAuth";

type FavoriteKind = "party" | "property";

const TARGET_TYPES: Record<FavoriteKind, string> = {
  party: "Party",
  property: "Property",
};

const LIST_KEYS: Record<FavoriteKind, string> = {
  party: "parties-grouped-by-location",
  property: "properties-grouped-by-location",
};

/** Saved / not saved for one listing, asks guests to log in first. */
const useFavorite = (kind: FavoriteKind, id?: string) => {
  const qc = useQueryClient();
  const { data: user } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const [saving, setSaving] = useState(false);

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
    if (!id || saving) return;

    setSaving(true);
    const request = isSaved
      ? removeFavoriteByTarget(id)
      : adminCaller.post("/favorites", {
          targetId: id,
          targetType: TARGET_TYPES[kind],
        });

    request
      .then(() =>
        Promise.all([
          qc.invalidateQueries({ queryKey: favoritesQueryKey }),
          qc.invalidateQueries({ queryKey: [LIST_KEYS[kind]] }),
        ]),
      )
      .finally(() => setSaving(false));
  };

  return { isSaved, saving, toggleSaved };
};

export default useFavorite;
