import type { ListingHost, Visibility } from "./listing";

export type TParty = {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  location: string;
  images: [string];
  rating?: number;
  guest_capacity: string;
  charge_type: "person" | "hour" | "day";
  party_rules: string;
  is_ticket_sales: boolean;
  price: string;
  beds: string;
  bathrooms: string;
  start_date: Date;
  end_date: Date;
  start_time?: string;
  status?: "published" | "draft";
  visibility?: Visibility;
  published_at?: Date;
  createdAt: Date;
  updatedAt: Date;
  party_type: string;
  isFavorite?: boolean;
  host?: ListingHost | null;
};

export type TGroupedParties = {
  caption: string;
  parties: TParty[];
};
