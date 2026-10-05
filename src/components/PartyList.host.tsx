import { EyeIcon, Pencil, Trash2 } from "lucide-react";
import type { IParty } from "../types/listing";
import { formatPartyWhen } from "../lib/partyTime";
import { useState } from "react";
import { DeleteListingModal } from "./parties/DeleteListingModal";
import { useNavigate } from "react-router-dom";

interface IPartyListing {
  data: IParty[];
}

const PartyListing: React.FC<IPartyListing> = ({ data }) => {
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
      {data.map((l, i: number) => (
        <ListingRow onDelete={onDelete} key={i} listing={l} />
      ))}

      <DeleteListingModal
        listingId={partyId}
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
      />
    </section>
  );
};

const ListingRow: React.FC<{
  listing: IParty;
  onDelete: (id: string) => void;
}> = ({ listing, onDelete }) => {
  const navigate = useNavigate();

  const onViewDetails = () => {
    navigate(`/parties/${listing._id}`);
  };

  const onEdit = () => {
    navigate(`/become-a-host/party?p=${listing._id}`);
  };

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
      <img
        src={listing.images[0]}
        alt={listing.title}
        className="h-16 w-16 rounded-2xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {listing.title}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {listing.location} · {listing.guest_capacity} guests · $
          {listing.price} / {listing.charge_type ?? "person"}
          {listing.start_date
            ? ` · ${formatPartyWhen(listing)}`
            : ""}
        </p>
      </div>
      <button
        onClick={onViewDetails}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors cursor-pointer"
        aria-label="Edit listing"
      >
        <EyeIcon className="h-4 w-4 text-foreground" />
      </button>
      <button
        title="Edit party"
        onClick={onEdit}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors cursor-pointer"
        aria-label="Edit listing"
      >
        <Pencil className="h-4 w-4 text-foreground" />
      </button>
      <button
        onClick={() => onDelete(listing._id)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        aria-label="Delete listing"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default PartyListing;
