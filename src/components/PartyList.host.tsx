import type { IParty } from "../types/listing";
import { formatPartyWhen } from "../lib/partyTime";
import { useState } from "react";
import { DeleteListingModal } from "./parties/DeleteListingModal";
import { useNavigate } from "react-router-dom";
import HostListingRow from "./HostListingRow";
import useAppContext from "./hooks/useAppContext";
import { displayPrice, formatPrice } from "../lib/currency";

interface IPartyListing {
  data: IParty[];
}

const PartyListing: React.FC<IPartyListing> = ({ data }) => {
  const navigate = useNavigate();
  const { currency } = useAppContext();
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [partyId, setPartyId] = useState<string>("");

  const onDelete = (id: string) => {
    setPartyId(id);
    setIsDeleteModal(true);
  };

  if (data?.length < 1) return;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground capitalize tracking-wider">
        Your parties ({data?.length})
      </h2>
      {data.map((listing) => (
        <HostListingRow
          key={listing._id}
          kind="party"
          image={listing.images?.[0]}
          title={listing.title}
          draft={listing.status === "draft"}
          isPrivate={listing.visibility === "private"}
          details={[
            listing.location,
            `${listing.guest_capacity} guests`,
            `${formatPrice(displayPrice(Number(listing.price), currency), currency)} / ${listing.charge_type ?? "person"}`,
            listing.start_date ? formatPartyWhen(listing) : "",
          ]
            .filter(Boolean)
            .join(" · ")}
          onView={() => navigate(`/parties/${listing._id}`)}
          onEdit={() => navigate(`/become-a-host/party?p=${listing._id}`)}
          onDelete={() => onDelete(listing._id)}
        />
      ))}

      <DeleteListingModal
        listingId={partyId}
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
      />
    </section>
  );
};

export default PartyListing;
