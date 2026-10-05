import { useQuery } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import PartyLists from "../components/parties/PartyLists";
import PropertyLists from "../components/properties/PropertyLists";
import PropertyCardSkeleton from "../components/parties/PropertCardSkeleton";
import useAuth from "../components/hooks/useAuth";
import type { TGroupedParties } from "../types/parties";
import type { TGroupedProperties } from "../types/listing";
import { adminCaller } from "../interceptors/http";

const AllPage: React.FC = () => {
  const { data: user, isLoading: userLoading } = useAuth();
  // Signed-in endpoints include whether each item is in the user's favorites.
  const suffix = user && !userLoading ? "grouped-by-location-user" : "grouped-by-location";

  const parties = useQuery<TGroupedParties[]>({
    queryKey: ["parties-grouped-by-location", `/parties/${suffix}`],
    queryFn: () =>
      adminCaller.get(`/parties/${suffix}`).then((res) => res.data?.data ?? []),
    refetchOnWindowFocus: false,
  });

  const properties = useQuery<TGroupedProperties[]>({
    queryKey: ["properties-grouped-by-location", `/property/${suffix}`],
    queryFn: () =>
      adminCaller.get(`/property/${suffix}`).then((res) => res.data?.data ?? []),
    refetchOnWindowFocus: false,
  });

  const isLoading = parties.isLoading || properties.isLoading;
  const isEmpty = !parties.data?.length && !properties.data?.length;

  return (
    <AppLayout>
      <div className="w-full space-y-12 max-w-7xl mx-auto p-4 lg:p-5">
        {isLoading ? (
          <div className="w-full gap-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
            {Array.from({ length: 7 }, (_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="rounded-3xl border border-dashed border-border p-14 text-center">
            <Compass className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <p className="font-bold">Nothing listed yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon for parties and homes near you.
            </p>
          </div>
        ) : (
          <>
            {parties.data?.map((group) => (
              <PartyLists
                key={`party-${group.caption}`}
                items={group.parties}
                title={group.caption}
              />
            ))}
            {properties.data?.map((group) => (
              <PropertyLists
                key={`property-${group.caption}`}
                items={group.properties}
                title={group.caption}
              />
            ))}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AllPage;
