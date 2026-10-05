import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, LoaderCircle, Trash2 } from "lucide-react";
import AppLayout from "./layout/AppLayout";
import NotSignedIn from "./auth/NotSignedInWrapper";
import { PartyListCard } from "./parties/PartyListCard";
import { PropertyListCard } from "./properties/PropertyListCard";
import { favoritesQueryKey, removeFavorite } from "../lib/favorites";
import { adminCaller } from "../interceptors/http";
import type { TParty } from "../types/parties";
import type { IProperty } from "../types/listing";

interface IFavoriteItem<T> {
  _id: string;
  targetType: "Party" | "Property";
  targetId: T | null;
}

export const FavoritesPage = () => {
  const queryClient = useQueryClient();
  const {
    data: favorites = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: () => adminCaller.get("/favorites").then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  const handleRemove = async (favoriteId: string) => {
    await removeFavorite(favoriteId);
    await queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
  };

  // targetId is null when the saved listing has since been deleted.
  const parties = (favorites as IFavoriteItem<TParty>[]).filter(
    (favorite) => favorite?.targetType === "Party" && favorite.targetId,
  );
  const homes = (favorites as IFavoriteItem<IProperty>[]).filter(
    (favorite) => favorite?.targetType === "Property" && favorite.targetId,
  );

  const removeButton = (favoriteId: string, title?: string) => (
    <button
      type="button"
      onClick={() => handleRemove(favoriteId)}
      className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-2 text-muted-foreground shadow-sm hover:text-red-500"
      aria-label={`Remove ${title ?? "listing"} from favorites`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );

  return (
    <AppLayout>
      <NotSignedIn>
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <div className="mb-8 flex items-center gap-3">
            <Heart className="h-7 w-7 fill-red-500 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
              <p className="text-sm text-muted-foreground">
                Your saved parties and places
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <LoaderCircle className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Favorites could not be loaded. Please try again.
            </p>
          ) : parties.length === 0 && homes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-14 text-center">
              <Heart className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
              <p className="font-bold">No favorites yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the heart on a party or home to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {parties.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-bold tracking-tight">Parties</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {parties.map((favorite, index) => (
                      <div key={favorite._id} className="relative">
                        <PartyListCard
                          party={favorite.targetId as TParty}
                          index={index}
                        />
                        {removeButton(favorite._id, favorite.targetId?.title)}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {homes.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-bold tracking-tight">Homes</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {homes.map((favorite, index) => (
                      <div key={favorite._id} className="relative">
                        <PropertyListCard
                          property={{
                            ...(favorite.targetId as IProperty),
                            isFavorite: true,
                          }}
                          index={index}
                        />
                        {removeButton(favorite._id, favorite.targetId?.title)}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </NotSignedIn>
    </AppLayout>
  );
};
