export type HostingType = "party" | "property"

export type PriceMode = "person" | "hour" | "night"

export interface Listing {
  id: string
  title: string
  location: string
  category: string // e.g. "Rooftops", "Tree House", "Beach front" or a party type
  images: string[]
  rating: number
  reviewsCount: number
  guestsCount: number
  price: number
  priceUnit: string // "hour" | "night" | "2 nights" | "person"
  bedroomsCount: number
  bedsCount: number
  // Host-specific extensions (used for user-created listings)
  description?: string
  amenities?: string[]
  rules?: string
  hostingType?: HostingType
  priceMode?: PriceMode
  partyType?: string // one of the 18 party types
  startDate?: string // ISO date
  endDate?: string // ISO date
  activities?: string
  ticketed?: boolean
  isOwnedByUser?: boolean
  hostName?: string
}

export interface HostProfile {
  name: string
  location: string
  phone: string
  bio: string
  avatar: string
  email?: string
  country?: string
  state?: string
  city?: string
}

export interface Wallet {
  balance: number
  transactions: WalletTransaction[]
}

export interface WalletTransaction {
  id: string
  date: string
  label: string
  amount: number
  type: "credit" | "debit"
}

export interface Booking {
  id: string
  listingId: string
  title: string
  location: string
  image: string
  date: string
  guests: number
  total: number
}
