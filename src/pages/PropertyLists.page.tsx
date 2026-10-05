import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import PropertyLists from "../components/properties/PropertyLists";
import PropertyCardSkeleton from "../components/parties/PropertCardSkeleton";
import useAuth from "../components/hooks/useAuth";
import { adminCaller } from "../interceptors/http";
import type { TGroupedProperties } from "../types/listing";

const PropertiesPage: React.FC = () => {
  const { data: user, isLoading: userLoading } = useAuth();

  const endpoint = useMemo(
    () =>
      user && !userLoading
        ? "/property/grouped-by-location-user"
        : "/property/grouped-by-location",
    [user, userLoading],
  );

  const { data, isLoading } = useQuery<TGroupedProperties[]>({
    queryKey: ["properties-grouped-by-location", endpoint],
    queryFn: () => adminCaller.get(endpoint).then((res) => res.data?.data ?? []),
    refetchOnWindowFocus: false,
  });

  return (
    <AppLayout>
      <div className="w-full space-y-12 max-w-7xl mx-auto p-4 lg:p-5">
        {isLoading ? (
          <div className="w-full gap-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
            {Array.from({ length: 7 }, (_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : !data?.length ? (
          <div className="rounded-3xl border border-dashed border-border p-14 text-center">
            <Home className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <p className="font-bold">No homes listed yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon, or list your own place from the host dashboard.
            </p>
          </div>
        ) : (
          data.map((group) => (
            <PropertyLists
              key={group.caption}
              items={group.properties}
              title={group.caption}
            />
          ))
        )}
      </div>
    </AppLayout>
  );
};

export default PropertiesPage;
