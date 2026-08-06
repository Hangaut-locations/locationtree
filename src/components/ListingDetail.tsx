import { format } from "date-fns"
import { ArrowLeft, Eye, Heart, MapPin, Share2, Shield, Star, Tv, Utensils, Wifi } from "lucide-react"
import type React from "react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { type CurrencyCode, displayPrice, formatPrice } from "../lib/currency"
import type { Listing } from "../types/listing"

interface ListingDetailProps {
  listing: Listing
  onBack: () => void
  onWishlistToggle: (id: string) => void
  isWishlisted: boolean
  currency: CurrencyCode
  onReserve: (listing: Listing, total: number) => void
}

export const ListingDetail: React.FC<ListingDetailProps> = ({
  listing,
  onBack,
  onWishlistToggle,
  isWishlisted,
  currency,
  onReserve,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "facilities" | "reviews">("overview")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const numberOfNights =
    dateRange?.from && dateRange?.to
      ? Math.max(1, Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)))
      : 2

  const totalPrice = numberOfNights * listing.price
  const unitPrice = formatPrice(displayPrice(listing.price, currency), currency)
  const formattedTotal = formatPrice(displayPrice(totalPrice, currency), currency)

  // Hardcoded mockup review instances
  const reviews = [
    {
      name: "Jon",
      date: "January 2023",
      text: "Still perfect, as before.",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Alin",
      date: "December 2022",
      text: "Tranquil and nice place.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Oleksii",
      date: "November 2022",
      text: "As described, the flat is located in a quiet area near London Docklands, which was convenient for us. Communication was prompt.",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
    },
    {
      name: "Jack",
      date: "October 2022",
      text: "Another comfortable stay in this very well-equipped apartment.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 transition-colors duration-300">
      {/* Back button and actions header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-black text-foreground hover:text-purple-950 dark:hover:text-purple-300 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to listings</span>
        </button>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 md:py-2 text-xs md:text-sm font-black text-foreground hover:bg-muted transition-all cursor-pointer">
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={() => onWishlistToggle(listing.id)}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 md:py-2 text-xs md:text-sm font-black text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            <span>{isWishlisted ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Title block */}
      <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mb-6">{listing.title}</h1>

      {/* Hero Image Container */}
      <div className="relative aspect-video max-h-[460px] w-full overflow-hidden rounded-[32px] border border-border shadow-md mb-8">
        <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
      </div>

      {/* Subtitles details */}
      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-black text-foreground tracking-tight">Room in {listing.location}</h2>
        <p className="text-sm font-semibold text-muted-foreground">
          {listing.bedroomsCount || 2} bedrooms · {listing.bedsCount || 1} king bed · Private attached bathroom
        </p>
      </div>

      {/* Navigation tabs row */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-8">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`py-2.5 md:py-2 px-5 rounded-full text-sm font-black transition-all cursor-pointer ${
            activeSubTab === "overview"
              ? "bg-purple-950 text-white dark:bg-purple-800"
              : "bg-muted/15 text-purple-950 dark:text-purple-300 hover:bg-muted/30"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSubTab("facilities")}
          className={`py-2.5 md:py-2 px-5 rounded-full text-sm font-black transition-all cursor-pointer ${
            activeSubTab === "facilities"
              ? "bg-purple-950 text-white dark:bg-purple-800"
              : "bg-muted/15 text-purple-950 dark:text-purple-300 hover:bg-muted/30"
          }`}
        >
          Facilities
        </button>
        <button
          onClick={() => setActiveSubTab("reviews")}
          className={`py-2.5 md:py-2 px-5 rounded-full text-sm font-black transition-all cursor-pointer ${
            activeSubTab === "reviews"
              ? "bg-purple-950 text-white dark:bg-purple-800"
              : "bg-muted/15 text-purple-950 dark:text-purple-300 hover:bg-muted/30"
          }`}
        >
          Review
        </button>

        {/* Map icon */}
        <button className="ml-auto h-9 w-9 flex items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer">
          <MapPin className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Layout details grid: Details on Left, Booking card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 mb-16">
        {/* Left Columns details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tag pills headered by TT as shown in screenshot */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-foreground">TT</h3>
            <div className="flex flex-wrap gap-2.5">
              <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground">
                <Wifi className="h-4 w-4 text-purple-950 dark:text-purple-300" />
                <span>Wifi</span>
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground">
                <MapPin className="h-4 w-4 text-purple-950 dark:text-purple-300" />
                <span>Habour View</span>
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground">
                <Eye className="h-4 w-4 text-purple-950 dark:text-purple-300" />
                <span>City view</span>
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground">
                <Shield className="h-4 w-4 text-purple-950 dark:text-purple-300" />
                <span>Waterfront</span>
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground">
                <Tv className="h-4 w-4 text-purple-950 dark:text-purple-300" />
                <span>HDTV with Roku</span>
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground">
                <Utensils className="h-4 w-4 text-purple-950 dark:text-purple-300" />
                <span>Kitchen</span>
              </span>
            </div>
          </div>

          <div className="border-b border-border/50 pb-1" />

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Description</h3>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
              This is a penthouse in the Queen of The Isle Apartments. The flat benefits from 2 outdoor spaces: a large
              balcony and a separate terrace for those who like to relax in the evening.
            </p>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
              The flat comprises a large open-plan reception and kitchen, 2 double bedrooms, and 2 bathrooms (1
              en-suite) - only the master en-suite super king bedroom is available to book (shared flat).
            </p>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
              This apartment's excellent location is moments away from South Quay DLR Station and Canary Wharf's array
              of bars, restaurants.
            </p>
          </div>

          <div className="border-b border-border/50 pb-1" />

          {/* Host Detail */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-foreground overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
                alt="Host avatar"
              />
            </div>
            <div>
              <h4 className="text-sm font-black text-foreground">Hosted by Robin</h4>
              <p className="text-xs font-semibold text-muted-foreground">Superhost since 2021</p>
            </div>
          </div>
        </div>

        {/* Right Columns details: reservation widget and calendar map mockups */}
        <div className="space-y-6">
          {/* Reservation Card */}
          <div className="rounded-[32px] border border-border bg-card p-6 shadow-md space-y-4">
            <div className="text-center pb-2">
              <span className="text-xl font-black text-foreground">{unitPrice}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {" "}
                for {numberOfNights} {numberOfNights === 1 ? "night" : "nights"}
              </span>
            </div>

            {/* Popover Date Selection */}
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    className="grid grid-cols-2 gap-0 border border-border/80 rounded-xl p-2.5 text-left active:scale-97 transition-all duration-160 ease-[var(--ease-out)] cursor-pointer h-14 w-full focus:outline-hidden focus:ring-2 focus:ring-purple-600/20 bg-card"
                  />
                }
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Check-in</span>
                  <span className="text-xs font-bold text-foreground truncate">
                    {dateRange?.from ? format(dateRange.from, "MMM dd, yyyy") : "Add date"}
                  </span>
                </div>
                <div className="flex flex-col border-l border-border/80 pl-4">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Check-out</span>
                  <span className="text-xs font-bold text-foreground truncate">
                    {dateRange?.to ? format(dateRange.to, "MMM dd, yyyy") : "Add date"}
                  </span>
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 z-50 bg-card border border-border shadow-xl rounded-3xl"
                align="center"
                sideOffset={8}
              >
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={1} />
              </PopoverContent>
            </Popover>

            <div className="border border-border/80 rounded-xl p-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Guests</span>
                <span className="text-xs font-bold text-foreground">2 guests</span>
              </div>
            </div>

            {/* Dynamic summary if dates are selected */}
            {dateRange?.from && dateRange?.to && (
              <div className="space-y-2 pt-2 text-xs font-bold text-muted-foreground">
                <div className="flex justify-between">
                  <span>
                    {unitPrice} x {numberOfNights} {numberOfNights === 1 ? "night" : "nights"}
                  </span>
                  <span>{formattedTotal}</span>
                </div>
                <div className="flex justify-between text-foreground text-sm font-black border-t border-border/60 pt-2">
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
              </div>
            )}

            {/* Reserve button */}
            <button
              onClick={() => {
                if (!dateRange?.from || !dateRange?.to) {
                  alert("Please select check-in and check-out dates first!")
                } else {
                  onReserve(listing, totalPrice)
                }
              }}
              className="w-full rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3.5 px-6 shadow-md transition-all duration-150 active:scale-95 cursor-pointer text-sm text-center"
            >
              Reserve
            </button>
          </div>

          {/* Calendar visual block matching screenshot details */}
          <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-foreground">7 nights in New York</h4>
            <p className="text-[11px] font-semibold text-muted-foreground">Feb 19, 2022 - Feb 26, 2022</p>

            <div className="grid grid-cols-7 gap-y-1.5 text-center text-[10px] font-black">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span key={d} className="text-muted-foreground">
                  {d}
                </span>
              ))}
              {/* Empty paddings */}
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} />
              ))}
              {/* Calendar values mockup */}
              {Array.from({ length: 28 }).map((_, i) => {
                const day = i + 1
                const isSelected = day >= 19 && day <= 26
                return (
                  <span
                    key={i}
                    className={`py-1 rounded-full ${
                      isSelected ? "bg-purple-950 text-white dark:bg-purple-800" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {day}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Map Preview image */}
          <div className="rounded-[32px] border border-border bg-card overflow-hidden shadow-sm">
            <div className="h-44 bg-muted relative">
              {/* Google Maps mock placeholder */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-0.118092,51.509865,12,0/400x200?access_token=mock')`,
                }}
              >
                <div className="w-full h-full bg-[#e5e3df] flex items-center justify-center relative">
                  <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500">
                    <div className="h-3 w-3 rounded-full bg-red-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-border flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-green-600" />
              <span className="text-xs font-black text-foreground">Verified location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities detailed section */}
      <div id="facilities" className="border-t border-border/60 pt-10 mb-12">
        <span className="inline-block bg-purple-950 text-white dark:bg-purple-800 rounded-full px-4 py-1.5 text-xs font-black mb-4">
          Facilities
        </span>
        <h3 className="text-xl font-black text-foreground mb-6">What this place offers</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm font-semibold text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <Wifi className="h-4.5 w-4.5" />
            <span>Wireless Internet</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4.5 w-4.5" />
            <span>Habour view</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Eye className="h-4.5 w-4.5" />
            <span>City view</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Shield className="h-4.5 w-4.5" />
            <span>Waterfront</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Tv className="h-4.5 w-4.5" />
            <span>HDTV with Roku</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Utensils className="h-4.5 w-4.5" />
            <span>Kitchen</span>
          </div>
        </div>

        <button className="rounded-full border border-border px-5 py-2.5 text-sm font-black text-foreground hover:bg-muted transition-colors cursor-pointer">
          Show all amenities
        </button>
      </div>

      {/* Reviews Detailed Section */}
      <div id="reviews" className="border-t border-border/60 pt-10 mb-16">
        <span className="inline-block bg-purple-950 text-white dark:bg-purple-800 rounded-full px-4 py-1.5 text-xs font-black mb-4">
          Reviews
        </span>

        <div className="flex items-center gap-2 mb-8">
          <Star className="h-5 w-5 text-purple-950 dark:text-purple-300 fill-current" />
          <span className="text-xl font-black text-foreground">5.0 · 27 reviews</span>
        </div>

        {/* Score Progress indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-8">
          {["Cleanliness", "Accuracy", "Communication", "Location", "Check-in", "Value"].map((cat) => (
            <div key={cat} className="flex items-center justify-between text-xs font-black text-foreground">
              <span>{cat}</span>
              <div className="flex items-center gap-3 w-40">
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-950 dark:bg-purple-400 rounded-full w-[95%]" />
                </div>
                <span>4.9</span>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews comments grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {reviews.map((rev, idx) => (
            <div key={idx} className="space-y-3.5 border border-border/40 p-5 rounded-2xl bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <img src={rev.avatar} alt={rev.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-sm font-black text-foreground">{rev.name}</h4>
                  <p className="text-[10px] font-semibold text-muted-foreground">{rev.date}</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed">{rev.text}</p>
            </div>
          ))}
        </div>

        <button className="rounded-full border border-border px-5 py-2.5 text-sm font-black text-foreground hover:bg-muted transition-colors cursor-pointer">
          Show all reviews
        </button>
      </div>
    </div>
  )
}
