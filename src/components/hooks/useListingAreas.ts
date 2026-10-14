import { useQuery } from "@tanstack/react-query";
import { adminCaller } from "../../interceptors/http";
import type { TGroupedParties } from "../../types/parties";
import type { TGroupedProperties } from "../../types/listing";
import useAuth from "./useAuth";

/**
 * Locations of every listed party / home, for the search suggestions.
 * Same query keys as the listing pages, so it reuses what they already loaded.
 */
const useListingAreas = (kind: "homes" | "parties" | "all", enabled: boolean) => {
  const { data: user, isLoading: userLoading } = useAuth();
  const suffix = user && !userLoading ? "grouped-by-location-user" : "grouped-by-location";

  const parties = useQuery<TGroupedParties[]>({
    queryKey: ["parties-grouped-by-location", `/parties/${suffix}`],
    queryFn: () => adminCaller.get(`/parties/${suffix}`).then((res) => res.data?.data ?? []),
    refetchOnWindowFocus: false,
    enabled: enabled && kind !== "homes",
  });

  const properties = useQuery<TGroupedProperties[]>({
    queryKey: ["properties-grouped-by-location", `/property/${suffix}`],
    queryFn: () => adminCaller.get(`/property/${suffix}`).then((res) => res.data?.data ?? []),
    refetchOnWindowFocus: false,
    enabled: enabled && kind !== "parties",
  });

  const partyAreas =
    kind === "homes"
      ? []
      : (parties.data ?? []).flatMap((group) => group.parties.map((party) => party.location));
  const homeAreas =
    kind === "parties"
      ? []
      : (properties.data ?? []).flatMap((group) => group.properties.map((place) => place.location));

  return [...partyAreas, ...homeAreas];
};

export default useListingAreas;
