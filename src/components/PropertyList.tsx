import { EyeIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IProperty } from "../types/listing";
import { DeleteListingModal } from "./parties/DeleteListingModal";

interface IPropertyListing {
  data: IProperty[];
}

const PropertyListing: React.FC<IPropertyListing> = ({ data }) => {
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [propertyId, setPropertyId] = useState<string>("");

  const onDelete = (id: string) => {
    setPropertyId(id);
    setIsDeleteModal(true);
  };

  if (data?.length < 1) return;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground capitalize tracking-wider">
        Your properties ({data?.length})
      </h2>
      {data.map((property) => (
        <ListingRow
          onDelete={onDelete}
          key={property._id}
          property={property}
        />
      ))}

      <DeleteListingModal
        listingId={propertyId}
        resource="property"
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
      />
    </section>
  );
};

const ListingRow: React.FC<{
  property: IProperty;
  onDelete: (id: string) => void;
}> = ({ property, onDelete }) => {
  const navigate = useNavigate();
  const isDraft = property.status === "draft";

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
      {property.images?.[0] ? (
        <img
          src={property.images[0]}
          alt={property.title}
          className="h-16 w-16 rounded-2xl object-cover shrink-0"
        />
      ) : (
        <div className="h-16 w-16 rounded-2xl bg-muted shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {property.title}
          </p>
          {isDraft && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              Draft
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {property.location} · {property.guest_capacity} guests · $
          {property.price} / {property.charge_type}
        </p>
      </div>
      <button
        title="View property"
        onClick={() => navigate(`/homes/${property._id}`)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors cursor-pointer"
        aria-label="View listing"
      >
        <EyeIcon className="h-4 w-4 text-foreground" />
      </button>
      <button
        title="Edit property"
        onClick={() => navigate(`/become-a-host/property?p=${property._id}`)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors cursor-pointer"
        aria-label="Edit listing"
      >
        <Pencil className="h-4 w-4 text-foreground" />
      </button>
      <button
        title="Delete property"
        onClick={() => onDelete(property._id)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        aria-label="Delete listing"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default PropertyListing;
