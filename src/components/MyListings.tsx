import { CalendarDays, Home, PartyPopper, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminCaller } from "../interceptors/http";
import PartyListing from "./PartyList.host";
import PropertyListing from "./PropertyList";

const MyListings: React.FC = () => {
  const { data: parties = [], isLoading } = useQuery({
    queryKey: ["my-parties"],
    queryFn: () => adminCaller.get("/parties/mine").then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  console.log("parties data", parties);

  const listings = (parties || [])?.length + (parties || []).length;

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      {/* Add new */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/become-a-host/party" className="w-full flex">
          <button className="w-full group flex items-center gap-4 rounded-3xl border border-border bg-card p-6 text-left hover:border-purple-950/40 hover:shadow-md transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PartyPopper className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Host a new party
              </p>
              <p className="text-xs text-muted-foreground">
                Add a new party listing
              </p>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </button>
        </Link>

        <Link to="/become-a-host/property" className="w-full flex">
          <button className="w-full group flex items-center gap-4 rounded-3xl border border-border bg-card p-6 text-left hover:border-purple-950/40 hover:shadow-md transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                List a new property
              </p>
              <p className="text-xs text-muted-foreground">
                Add a place / spot for events
              </p>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            You have no listings yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a party or property to start earning.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <PartyListing data={parties} />
          {/* <PropertyListing data={parties} /> */}
        </div>
      )}
    </div>
  );
};

export default MyListings;
