import type { ListingHost, ListingVideo, Visibility } from "./listing";

export type TParty = {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  location: string;
  images: [string];
  video?: ListingVideo | null;
  rating?: number;
  guest_capacity: string;
  charge_type: "person" | "hour" | "day";
  party_rules: string;
  is_ticket_sales: boolean;
  price: string;
  ticket_options?: {
    name: string;
    price: number;
    available: number;
    details?: string;
    left?: number;
  }[];
  beds: string;
  bathrooms: string;
  start_date: Date;
  end_date: Date;
  start_time?: string;
  end_time?: string;
  status?: "published" | "draft";
  visibility?: Visibility;
  private_key?: string;
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
