import { useMemo, useState } from "react";
import { CategorySlider } from "../components/CategorySlider";
import AppLayout from "../components/layout/AppLayout";
import { SearchHeader } from "../components/SearchHeader";
import type { FilterState } from "../components/FilterModal";
import PartyLists from "../components/parties/PartyLists";
import { useQuery } from "@tanstack/react-query";
import { adminCaller } from "../interceptors/http";
import type { TGroupedParties } from "../types/parties";
import PropertyCardSkeleton from "../components/parties/PropertCardSkeleton";
import useAuth from "../components/hooks/useAuth";
import SearchSummary, { NoSearchResults } from "../components/SearchSummary";
import { filterGroups, partyMatches, useListingSearch } from "../lib/search";

const PartiesPage: React.FC = () => {
  const { data: user, isLoading: userLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"location" | "planning">(
    "location",
  );
  const [activeCategory, setActiveCategory] = useState<string>("Rooftops");

  const [filters, setFilters] = useState<FilterState>({
    placeType: "any",
    minPrice: 50,
    maxPrice: 1200,
    bedrooms: 1,
    beds: 1,
    adults: 1,
    children: 1,
    pets: 1,
  });

  const endpoint = useMemo(() => {
    let url = "/parties/grouped-by-location";
    if (user && !userLoading) {
      url = "/parties/grouped-by-location-user";
    }
    return url;
  }, [user, userLoading]);

  const { data, isLoading } = useQuery({
    queryKey: ["parties-grouped-by-location", endpoint],
    queryFn: () => adminCaller.get(endpoint).then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  const { search, isActive } = useListingSearch();
  const results = isActive
    ? filterGroups(
        (data?.data ?? []) as TGroupedParties[],
        (group) => group.parties,
        (party, area) => partyMatches(party, search, area),
      )
    : [];

  const handleCategorySelect = (category: string) => {
    // setIsLoading(true);
    setActiveCategory(category);
    setTimeout(() => {
      //   setIsLoading(false);
    }, 450);
  };

  return (
    <AppLayout>
      {/* <CategorySlider
        activeCategory={activeCategory}
        // activeTab={activeTab}
        onSelectCategory={handleCategorySelect}
      /> */}

      <div className="w-full space-y-12 max-w-7xl mx-auto p-4 lg:p-5">
        {isLoading ? (
          <div className="w-full gap-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : isActive ? (
          <>
            <SearchSummary
              search={search}
              count={results.reduce((sum, group) => sum + group.items.length, 0)}
            />
            {results.length ? (
              results.map((group) => (
                <PartyLists key={group.caption} items={group.items} title={group.caption} />
              ))
            ) : (
              <NoSearchResults />
            )}
          </>
        ) : (
          <>
            {data?.data?.map((item: TGroupedParties, index: number) => (
              <PartyLists
                items={item.parties}
                title={item.caption}
                key={index}
              />
            ))}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default PartiesPage;
