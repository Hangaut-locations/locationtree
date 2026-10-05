import type React from "react";
import type { IProperty } from "../../types/listing";
import { PropertyListCard } from "./PropertyListCard";

interface IPropertyLists {
  title: string;
  items: IProperty[];
}

const PropertyLists: React.FC<IPropertyLists> = ({ title, items = [] }) => (
  <section className="space-y-3 w-full">
    <h2 className="font-bold tracking-tight">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 w-full">
      {items.map((item, idx) => (
        <PropertyListCard key={item._id} property={item} index={idx} />
      ))}
    </div>
  </section>
);

export default PropertyLists;
