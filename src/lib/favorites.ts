import { adminCaller } from "../interceptors/http";
import type { TParty } from "../types/parties";

export type Favorite = {
  _id?: string;
  targetId: string | { _id: string };
  targetType: string;
  target?: TParty;
  party?: TParty;
};

export const favoritesQueryKey = ["favorites"];

export const getFavorites = async (): Promise<Favorite[]> => {
  const response = await adminCaller.get("/favorites");
  const payload = response.data?.data ?? response.data;
  const favorites = Array.isArray(payload)
    ? payload
    : (payload?.favorites ?? []);

  return favorites;
};

export const removeFavorite = (targetId: string) =>
  adminCaller.delete(`/favorites/${targetId}`);

const favoriteTargetId = (favorite: Favorite) =>
  typeof favorite.targetId === "string"
    ? favorite.targetId
    : favorite.targetId?._id;

/** The API deletes favorites by their own id, not by the listing id. */
export const removeFavoriteByTarget = async (targetId: string) => {
  const favorites = await getFavorites();
  await Promise.all(
    favorites
      .filter((favorite) => favorite._id && favoriteTargetId(favorite) === targetId)
      .map((favorite) => removeFavorite(favorite._id as string)),
  );
};

export const isTargetFavorited = (favorites: Favorite[], targetId: string) =>
  favorites.some((favorite) => favoriteTargetId(favorite) === targetId);

export const favoriteParty = (favorite: Favorite): TParty | undefined =>
  favorite.target ?? favorite.party;
