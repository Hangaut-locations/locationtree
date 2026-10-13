import { SearchX } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { describeSearch, type ListingSearch } from "../lib/search";

/** "4 results for "lekki" · 20 Oct – 22 Oct" with a way back to everything. */
const SearchSummary = ({ search, count }: { search: ListingSearch; count: number }) => {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">
          {count} result{count === 1 ? "" : "s"}
        </span>{" "}
        for {describeSearch(search)}
      </p>
      <Link to={pathname} className="text-sm font-semibold text-purple-700 hover:underline">
        Clear search
      </Link>
    </div>
  );
};

export const NoSearchResults = () => {
  const { pathname } = useLocation();
  return (
    <div className="rounded-3xl border border-dashed border-border p-14 text-center">
      <SearchX className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
      <p className="font-bold">Nothing matches your search</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Try another area, different dates or any type.
      </p>
      <Link
        to={pathname}
        className="mt-4 inline-block rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-gray-400"
      >
        See everything
      </Link>
    </div>
  );
};

export default SearchSummary;
