import { Fragment } from "react";
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
import SearchSummary, { NoSearchResults } from "../components/SearchSummary";
import { filterGroups, partyMatches, placeMatches, useListingSearch } from "../lib/search";

type Listing = { published_at?: Date; createdAt: Date };

const newestIn = (items: Listing[]) =>
  Math.max(0, ...items.map((item) => new Date(item.published_at ?? item.createdAt).getTime() || 0));

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

  const { search, isActive } = useListingSearch();
  const partyGroups = isActive
    ? filterGroups(
        parties.data ?? [],
        (group) => group.parties,
        (party, area) => partyMatches(party, search, area),
      )
    : (parties.data ?? []).map((group) => ({ caption: group.caption, items: group.parties }));
  const placeGroups = isActive
    ? filterGroups(
        properties.data ?? [],
        (group) => group.properties,
        (place, area) => placeMatches(place, search, area),
      )
    : (properties.data ?? []).map((group) => ({
        caption: group.caption,
        items: group.properties,
      }));
  const resultCount = [...partyGroups, ...placeGroups].reduce(
    (sum, group) => sum + group.items.length,
    0,
  );

  // parties and homes mixed together, the group with the newest listing goes on top
  const sections = [
    ...partyGroups.map((group) => ({
      key: `party-${group.caption}`,
      newest: newestIn(group.items),
      node: <PartyLists items={group.items} title={group.caption} />,
    })),
    ...placeGroups.map((group) => ({
      key: `property-${group.caption}`,
      newest: newestIn(group.items),
      node: <PropertyLists items={group.items} title={group.caption} />,
    })),
  ].sort((a, b) => b.newest - a.newest);

  return (
    <AppLayout>
      <div className="w-full space-y-12 max-w-7xl mx-auto p-4 lg:p-5">
        {isLoading ? (
          <div className="w-full gap-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
            {Array.from({ length: 7 }, (_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : isActive ? (
          <>
            <SearchSummary search={search} count={resultCount} />
            {sections.length ? (
              sections.map((section) => <Fragment key={section.key}>{section.node}</Fragment>)
            ) : (
              <NoSearchResults />
            )}
          </>
        ) : isEmpty ? (
          <div className="rounded-3xl border border-dashed border-border p-14 text-center">
            <Compass className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <p className="font-bold">Nothing listed yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon for parties and homes near you.
            </p>
          </div>
        ) : (
          sections.map((section) => <Fragment key={section.key}>{section.node}</Fragment>)
        )}
      </div>
    </AppLayout>
  );
};

export default AllPage;
