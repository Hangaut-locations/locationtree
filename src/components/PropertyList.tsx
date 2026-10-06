import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IProperty } from "../types/listing";
import { DeleteListingModal } from "./parties/DeleteListingModal";
import HostListingRow from "./HostListingRow";

interface IPropertyListing {
  data: IProperty[];
}

const PropertyListing: React.FC<IPropertyListing> = ({ data }) => {
  const navigate = useNavigate();
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
        <HostListingRow
          key={property._id}
          kind="property"
          image={property.images?.[0]}
          title={property.title}
          badge={
            property.status === "draft" && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                Draft
              </span>
            )
          }
          details={`${property.location} · ${property.guest_capacity} guests · $${property.price} / ${property.charge_type}`}
          onView={() => navigate(`/homes/${property._id}`)}
          onEdit={() => navigate(`/become-a-host/property?p=${property._id}`)}
          onDelete={() => onDelete(property._id)}
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

export default PropertyListing;
