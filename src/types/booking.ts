export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled";

export interface BookingGuest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface BookingBase {
  _id: string;
  /** Only filled in with the guest's details on the host's reservations. */
  guestId: string | BookingGuest;
  hostId: string;
  guests: number;
  total: number;
  status: BookingStatus;
  note?: string;
  title: string;
  image?: string;
  location?: string;
  charge_type?: "person" | "hour" | "day";
  price?: number;
  createdAt: string;
}

export interface PartyBooking extends BookingBase {
  partyId: string;
  hours?: number;
  days?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
}

export interface PropertyBooking extends BookingBase {
  propertyId: string;
  start_at: string;
  end_at: string;
  hours: number;
}

export interface BookingLists {
  parties: PartyBooking[];
  properties: PropertyBooking[];
}

export interface TakenTime {
  start_at: string;
  end_at: string;
}
