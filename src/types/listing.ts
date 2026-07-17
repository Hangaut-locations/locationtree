export interface Listing {
  id: string
  title: string
  location: "Paris" | "Watford" | "London"
  category: string // e.g. "Rooftops", "Tree House", "Beach front", etc.
  images: string[] // Array of image URLs for carousel
  rating: number
  reviewsCount: number
  guestsCount: number
  price: number
  priceUnit: string // "hour" | "night" | "2 nights"
  bedroomsCount: number
  bedsCount: number
}
