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

/** One spot at a party. Only the guest who booked gets the codes back. */
export interface PartyTicket {
  name: string;
  email: string;
  code?: string;
  checked_in_at?: string;
}

export interface PartyBooking extends BookingBase {
  partyId: string;
  hours?: number;
  days?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  tickets?: PartyTicket[];
}

export interface PartyFriend {
  name: string;
  email?: string;
}

export interface CheckInResult {
  name: string;
  booked_by: string;
  party: string;
  group: number;
  group_checked_in: number;
  checked_in_at: string;
}

export interface PartyGuestList {
  title: string;
  spots: number;
  checked_in: number;
  guests: {
    name: string;
    booked_by: string;
    booking_id: string;
    checked_in_at: string | null;
  }[];
  without_codes: { booked_by: string; spots: number }[];
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
