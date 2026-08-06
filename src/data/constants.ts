// Party & listing category constants shared across the app.

export const PARTY_TYPES = [
  "House party",
  "Rooftop party",
  "Yacht party",
  "Field party",
  "Mansion Party",
  "Creative scene",
  "Visual scene",
  "Birthday Party",
  "Night Club",
  "Beach Party",
  "Halloween",
  "Horrific",
  "Barbecue",
  "Nature and Adventure",
  "Podcast Recording",
  "Live stream",
  "Shows",
  "Games",
] as const

export type PartyType = (typeof PARTY_TYPES)[number]

// Party types shown on the guest "Planning something" category slider.
export const PARTY_CATEGORIES: { id: string; name: string }[] = PARTY_TYPES.map((name) => ({ id: name, name }))

// Property/space types (place types) for "Listing a property".
export const PROPERTY_TYPES = [
  "Beach front",
  "Rooftops",
  "Homes",
  "Mansions",
  "Studio",
  "Castles",
  "Houseboat",
  "Cabin",
  "Tree House",
]

export const DEFAULT_HOST_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80"

export const DEFAULT_GUEST_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"

// Free image placeholders used for new party / property listings.
export const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
]
