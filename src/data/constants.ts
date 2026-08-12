// Party & listing category constants shared across the app.
import {
  House,
  Building2,
  Ship,
  Trees,
  Castle,
  Palette,
  Eye,
  Cake,
  Martini,
  Waves,
  Ghost,
  Skull,
  Beef,
  Mountain,
  Mic2,
  Radio,
  Theater,
  Gamepad2,
  MountainSnow,
  PanelsTopLeft,
  Home,
  Tent,
  Sparkles,
  Palmtree,
} from "lucide-react";

export const Party_Types = [
  {
    name: "House party",
    icon: House,
  },
  {
    name: "Rooftop party",
    icon: Building2,
  },
  {
    name: "Yacht party",
    icon: Ship,
  },
  {
    name: "Field party",
    icon: Trees,
  },
  {
    name: "Mansion Party",
    icon: Castle,
  },
  {
    name: "Creative scene",
    icon: Palette,
  },
  {
    name: "Visual scene",
    icon: Eye,
  },
  {
    name: "Birthday Party",
    icon: Cake,
  },
  {
    name: "Night Club",
    icon: Martini,
  },
  {
    name: "Beach Party",
    icon: Waves,
  },
  {
    name: "Halloween",
    icon: Ghost,
  },
  {
    name: "Horrific",
    icon: Skull,
  },
  {
    name: "Barbecue",
    icon: Beef,
  },
  {
    name: "Nature and Adventure",
    icon: Mountain,
  },
  {
    name: "Podcast Recording",
    icon: Mic2,
  },
  {
    name: "Live stream",
    icon: Radio,
  },
  {
    name: "Shows",
    icon: Theater,
  },
  {
    name: "Games",
    icon: Gamepad2,
  },

  // Additional types
  {
    name: "Amazing views",
    icon: MountainSnow,
  },
  {
    name: "Frames",
    icon: PanelsTopLeft,
  },
  {
    name: "Homes",
    icon: Home,
  },
  {
    name: "Houseboat",
    icon: Ship,
  },
  {
    name: "Cabin",
    icon: Tent,
  },
  {
    name: "OMG!",
    icon: Sparkles,
  },
  {
    name: "Islands",
    icon: Palmtree,
  },
] as const;

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

export const Property_Types = [
 {
  name:  "Beach front",
  icon: '/images/beachfront.svg'
 },
 {
  name:  "Roof tops",
  icon: '/images/rooftops.svg'
 },
 {
  name:  "Homes",
  icon: '/images/homes.svg'
 },
 {
  name:  "Mansions",
  icon: '/images/mansions.svg'
 },
 {
  name:  "Studio",
  icon: '/images/studio.svg'
 },
 {
  name:  "Castles",
  icon: '/images/studio.svg'
 },
 {
  name:  "House boat",
  icon: '/images/houseboat.svg'
 },
 {
  name:  "Cabin",
  icon: '/images/cabin.svg'
 },
 {
  name:  "Tree house",
  icon: '/images/treehouse.svg'
 },
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
