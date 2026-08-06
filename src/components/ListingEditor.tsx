import { CalendarDays, MapPin, Tag, Type, Users } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog"
import { PARTY_TYPES, PROPERTY_TYPES, SAMPLE_IMAGES } from "../data/constants"
import type { Listing, PriceMode } from "../types/listing"

interface ListingEditorProps {
  isOpen: boolean
  mode: "party" | "property"
  listing: Listing | null
  onClose: () => void
  onSave: (listing: Listing) => void
}

export const ListingEditor: React.FC<ListingEditorProps> = ({ isOpen, mode, listing, onClose, onSave }) => {
  const isParty = mode === "party"

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState(50)
  const [priceMode, setPriceMode] = useState<PriceMode>(isParty ? "person" : "person")
  const [guests, setGuests] = useState(10)
  const [bedrooms, setBedrooms] = useState(1)
  const [beds, setBeds] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [activities, setActivities] = useState("")
  const [rules, setRules] = useState("")
  const [description, setDescription] = useState("")
  const [ticketed, setTicketed] = useState(true)
  const [images, setImages] = useState<string[]>(SAMPLE_IMAGES.slice(0, 2))

  useEffect(() => {
    if (!isOpen) return
    setTitle(listing?.title ?? "")
    setCategory(listing?.category ?? (isParty ? "" : PROPERTY_TYPES[0]))
    setLocation(listing?.location ?? "")
    setPrice(listing?.price ?? 50)
    setPriceMode(listing?.priceMode ?? (isParty ? "person" : "person"))
    setGuests(listing?.guestsCount ?? 10)
    setBedrooms(listing?.bedroomsCount ?? 1)
    setBeds(listing?.bedsCount ?? 1)
    setStartDate(listing?.startDate ?? "")
    setEndDate(listing?.endDate ?? "")
    setActivities(listing?.activities ?? "")
    setRules(listing?.rules ?? "")
    setDescription(listing?.description ?? "")
    setTicketed(listing?.ticketed ?? true)
    setImages(listing?.images?.length ? listing.images : SAMPLE_IMAGES.slice(0, 2))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const categoryOptions = isParty ? PARTY_TYPES : PROPERTY_TYPES

  const handleSave = () => {
    const normalizedLocation = (["Paris", "Watford", "London"].find(
      (l) => l.toLowerCase() === location.trim().toLowerCase(),
    ) || "London") as "Paris" | "Watford" | "London"

    const updated: Listing = {
      id: listing?.id ?? `${isParty ? "party" : "property"}-listing-${Date.now()}`,
      title: title.trim() || `${category || "New"} ${isParty ? "Party" : "Place"}`,
      location: normalizedLocation,
      category,
      images,
      rating: listing?.rating ?? 5.0,
      reviewsCount: listing?.reviewsCount ?? 0,
      guestsCount: guests,
      price,
      priceUnit: priceMode,
      bedroomsCount: isParty ? 0 : bedrooms,
      bedsCount: isParty ? 0 : beds,
      hostingType: isParty ? "party" : "property",
      priceMode,
      partyType: isParty ? category : undefined,
      startDate: isParty ? startDate : undefined,
      endDate: isParty ? endDate : undefined,
      activities: isParty ? activities : undefined,
      rules,
      description: isParty ? activities || description : description,
      ticketed: isParty ? ticketed : undefined,
      amenities: listing?.amenities,
      isOwnedByUser: true,
    }
    onSave(updated)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-lg rounded-[28px] border-t border-border bg-card p-6 sm:p-7 shadow-2xl animate-in fade-in sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <DialogTitle className="text-xl font-black text-foreground tracking-tight mb-4 shrink-0">
          {listing ? "Edit listing" : isParty ? "Add a party" : "Add a property"}
        </DialogTitle>

        <div className="space-y-4 grow overflow-y-auto min-h-0 pr-1 -mr-1">
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Type className="h-3.5 w-3.5" /> Title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isParty ? "e.g. Rooftop Beach Party" : "e.g. Beachfront Rooftop"}
              className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
            />
          </label>

          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1.5">
              <Tag className="h-3.5 w-3.5" /> {isParty ? "Party type" : "Place type"}
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600 cursor-pointer"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Location
            </span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Paris, Watford, London"
              className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {isParty ? "Guest capacity" : "Guests"}
              </span>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
                className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">Price</span>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Per…</span>
            <div className="flex gap-1.5">
              {(["person", "hour", "night"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPriceMode(m)}
                  className={`rounded-full px-3 py-1.5 text-xs font-black transition-all cursor-pointer active:scale-95 ${
                    priceMode === m
                      ? "bg-purple-950 text-white"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  / {m}
                </button>
              ))}
            </div>
          </div>

          {!isParty && (
            <div className="grid grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Bedrooms</span>
                <input
                  type="number"
                  min={0}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value) || 0)}
                  className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Beds</span>
                <input
                  type="number"
                  min={0}
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value) || 0)}
                  className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
                />
              </label>
            </div>
          )}

          {isParty && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> Start date
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600 [color-scheme:light-dark]"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> End date
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600 [color-scheme:light-dark]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => setTicketed((prev) => !prev)}
                className={`w-full flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-xs font-bold transition-all cursor-pointer ${
                  ticketed ? "border-purple-950 dark:border-purple-600 bg-purple-950/5" : "border-border/80 bg-card"
                }`}
              >
                <input type="checkbox" checked={ticketed} readOnly className="accent-purple-950" />
                <span className="text-foreground">Guests book / buy tickets for reservation</span>
              </button>
            </>
          )}

          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              Description / Activities
            </span>
            <textarea
              value={isParty ? activities : description}
              onChange={(e) => (isParty ? setActivities(e.target.value) : setDescription(e.target.value))}
              rows={3}
              placeholder={isParty ? "What's happening at the party?" : "Describe your space"}
              className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-purple-600"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">Rules</span>
            <input
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. No outside drinks, ID required"
              className="w-full border border-border/80 bg-card rounded-2xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-purple-600"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 pt-5 shrink-0 border-t border-border/60 mt-4">
          <button
            onClick={onClose}
            className="rounded-full border border-border px-6 py-2.5 text-sm font-black text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-full bg-purple-950 hover:bg-purple-900 text-white font-bold py-2.5 px-6 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out cursor-pointer"
          >
            Save changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
