import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchLiveParties, type LiveParty } from "../../lib/live";
import PartyLive from "../party/PartyLive";

/** Parties whose host has the camera on, in a row under the search line. */
const LiveStrip = () => {
  const [watching, setWatching] = useState<LiveParty | null>(null);
  const { data } = useQuery({
    queryKey: ["live-parties"],
    queryFn: fetchLiveParties,
    refetchInterval: 8000,
    retry: false,
  });
  const parties = data?.parties ?? [];

  return (
    <>
      {parties.length > 0 && (
        <div className="border-b border-gray-200 bg-[#FBFBFB]">
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-3 lg:px-8">
            {parties.map((party) => (
              <button
                key={party.id}
                type="button"
                onClick={() => setWatching(party)}
                className="w-24 shrink-0 text-left"
              >
                <span className="relative block aspect-[3/4] overflow-hidden rounded-2xl border-2 border-red-600 bg-gray-200">
                  {party.image ? (
                    <img src={party.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center px-2 text-center text-xs font-semibold text-gray-600">
                      {party.hostName || party.title}
                    </span>
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Live
                  </span>
                </span>
                <span className="mt-1 block truncate text-xs font-semibold text-[#222]">
                  {party.title || party.hostName || "Live party"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {watching && (
        <PartyLive
          partyId={watching.id}
          ownerId={watching.ownerId}
          title={watching.title}
          screen
          onClose={() => setWatching(null)}
        />
      )}
    </>
  );
};

export default LiveStrip;
