import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IProperty } from "../types/listing";
import { DeleteListingModal } from "./parties/DeleteListingModal";
import HostListingRow from "./HostListingRow";
import useAppContext from "./hooks/useAppContext";
import { displayPrice, formatPrice } from "../lib/currency";

interface IPropertyListing {
  data: IProperty[];
}

const PropertyListing: React.FC<IPropertyListing> = ({ data }) => {
  const navigate = useNavigate();
  const { currency } = useAppContext();
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
          id={property._id}
          privateKey={property.private_key}
          kind="property"
          image={property.images?.[0]}
          title={property.title}
          draft={property.status === "draft"}
          isPrivate={property.visibility === "private"}
          details={`${property.location} · ${property.guest_capacity} guests · ${formatPrice(displayPrice(Number(property.price), currency), currency)} / ${property.charge_type}`}
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
