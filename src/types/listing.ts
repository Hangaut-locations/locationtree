export type HostingType = "party" | "property";

export type PriceMode = "person" | "hour" | "night";

export interface Listing {
  id: string;
  title: string;
  location: string;
  category: string; // e.g. "Rooftops", "Tree House", "Beach front" or a party type
  images: string[];
  rating: number;
  reviewsCount: number;
  guestsCount: number;
  price: number;
  priceUnit: string; // "hour" | "night" | "2 nights" | "person"
  bedroomsCount: number;
  bedsCount: number;
  // Host-specific extensions (used for user-created listings)
  description?: string;
  amenities?: string[];
  rules?: string;
  hostingType?: HostingType;
  priceMode?: PriceMode;
  partyType?: string; // one of the 18 party types
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  activities?: string;
  ticketed?: boolean;
  isOwnedByUser?: boolean;
  hostName?: string;
}

export interface HostProfile {
  name: string;
  location: string;
  phone: string;
  bio: string;
  avatar: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
}

/** Host's public profile, returned with a party or property's details. */
export interface ListingHost {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  createdAt?: string;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: "credit" | "debit";
}

export interface Booking {
  id: string;
  listingId: string;
  title: string;
  location: string;
  image: string;
  date: string;
  guests: number;
  total: number;
}

export type Visibility = "public" | "private";

export interface IParty {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  location: string;
  images: string[];
  guest_capacity: number;
  charge_type: "person" | "hour" | "day";
  party_rules: string;
  is_ticket_sales: string;
  price: number;
  beds: number;
  bathrooms: number;
  start_date: Date;
  end_date: Date;
  start_time?: string;
  status?: "draft" | "published";
  visibility?: Visibility;
  private_key?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProperty {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  location: string;
  images: string[];
  amenities: string[];
  status: "draft" | "published";
  visibility?: Visibility;
  private_key?: string;
  space_type: "entire" | "room" | "shared";
  property_type: string;
  booking_setting: "approve-first" | "instant";
  blocked_dates?: string[];
  guest_capacity: number;
  charge_type: "person" | "hour";
  property_rules?: string;
  price: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  isFavorite?: boolean;
  host?: ListingHost | null;
  published_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TGroupedProperties = {
  caption: string;
  properties: IProperty[];
};
