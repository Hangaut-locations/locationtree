import {
  Building,
  Frame,
  HelpCircle,
  Home,
  Minus,
  Mountain,
  Plus,
  Search,
  Ship,
  Tent,
  Trees,
  Tv,
  Waves,
} from "lucide-react"
import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Listing } from "../types/listing"

interface BecomeHostWizardProps {
  onAddListing: (newListing: Listing) => void
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export const BecomeHostWizard: React.FC<BecomeHostWizardProps> = ({ onAddListing }) => {
  const [step, setStep] = useState<WizardStep>(1)
  const navigate = useNavigate()

  // Form States
  const [category, setCategory] = useState<string>("Rooftops")
  const [spaceType, setSpaceType] = useState<"entire" | "room" | "shared">("entire")
  const [location, setLocation] = useState<string>("")
  const [guests, setGuests] = useState<number>(1)
  const [bedrooms, setBedrooms] = useState<number>(1)
  const [beds, setBeds] = useState<number>(1)
  const [bathrooms, setBathrooms] = useState<number>(1)
  const [title, setTitle] = useState<string>("Charming rooftop retreat")
  const [description, setDescription] = useState<string>(
    "A stylish space designed for memorable stays, calm mornings, and easy hosting.",
  )
  const [photos] = useState<string[]>([
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
  ])
  const [bookingSetting, setBookingSetting] = useState<"approve-first" | "instant">("approve-first")
  const [basePrice, setBasePrice] = useState<number>(75)
  const [amenities, setAmenities] = useState<Set<string>>(new Set())

  const categories = [
    { name: "Rooftops", icon: Building },
    { name: "Tree House", icon: Trees },
    { name: "Beach front", icon: Waves },
    { name: "Amazing views", icon: Mountain },
    { name: "Studio", icon: Tv },
    { name: "Frames", icon: Frame },
    { name: "Homes", icon: Home },
    { name: "Houseboat", icon: Ship },
    { name: "Cabin", icon: Tent },
  ]

  const handleNext = () => {
    if (step < 12) {
      setStep((prev) => (prev + 1) as WizardStep)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as WizardStep)
    }
  }

  const handleExit = () => {
    if (window.confirm("Are you sure you want to save and exit?")) {
      navigate("/")
    }
  }

  const toggleAmenity = (name: string) => {
    setAmenities((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleSubmit = () => {
    // Normalize location to match valid listing locations
    const normalizedLocation = (["Paris", "Watford", "London"].find(
      (loc) => loc.toLowerCase() === location.trim().toLowerCase(),
    ) || "Watford") as "Paris" | "Watford" | "London"

    // Mock create a new listing object
    const finalTitle = title.trim() || `Charming ${category} Stay`

    const newListing: Listing = {
      id: `mock-listing-${Date.now()}`,
      title: finalTitle,
      location: normalizedLocation,
      price: basePrice, // was: 150 + Math.floor(Math.random() * 200)
      priceUnit: "night",
      rating: 5.0,
      reviewsCount: 1,
      images: photos.slice(0, 2),
      category: category,
      guestsCount: guests,
      bedroomsCount: bedrooms,
      bedsCount: beds,
    }

    onAddListing(newListing)
    alert("Congratulations! Your place is successfully listed on Hangout.")
    navigate("/")
  }

  // Check step validation
  const isStepValid = () => {
    if (step === 2) return !!category
    if (step === 3) return !!spaceType
    if (step === 4) {
      return ["paris", "watford", "london"].includes(location.trim().toLowerCase())
    }
    if (step === 7) return photos.length > 0
    if (step === 8) return title.trim().length > 0
    if (step === 9) return description.trim().length > 0
    if (step === 12) return basePrice > 0
    return true
  }

  const renderCounterRow = (label: string, value: number, onChange: (val: number) => void, min = 1) => {
    return (
      <div className="flex items-center justify-between border-b border-border/40 py-5">
        <span className="text-base font-black text-foreground">{label}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-97 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-[transform,background-color] duration-160 ease-out"
          >
            <Minus className="h-4.5 w-4.5" />
          </button>
          <span className="w-5 text-center text-base font-black text-foreground">{value}</span>
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="flex h-10 w-10 md:h-8 md:w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-97 cursor-pointer transition-[transform,background-color] duration-160 ease-out"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Wizard Header */}
      <header className="sticky top-0 z-45 w-full border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center h-12 max-w-37.5 cursor-pointer" onClick={() => navigate("/")}>
          <img src="logo.png" alt="Hangout Logo" className="h-full w-full object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Support line matches available agents.")}
            className="flex h-10 w-10 sm:h-auto sm:w-auto items-center justify-center gap-1.5 rounded-full border border-border sm:px-4 sm:py-2 text-xs font-black text-foreground hover:bg-muted transition-all cursor-pointer"
            aria-label="Help"
          >
            <HelpCircle className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Questions?</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 md:py-2 text-xs md:text-sm font-black text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <span>Save & Exit</span>
          </button>
        </div>
      </header>

      {/* Progress Bar Indicator */}
      <div className="w-full bg-muted h-1">
        <div
          className="bg-purple-950 dark:bg-purple-650 h-full transition-all duration-300"
          style={{ width: `${(step / 12) * 100}%` }}
        />
      </div>

      {/* Wizard Body Container */}
      <main className="grow flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
          {/* Step 1: Introduction */}
          {step === 1 && (
            <div className="space-y-6">
              <span className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                Step 1
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                Tell us about your place
              </h1>
              <p className="text-base font-semibold text-muted-foreground leading-relaxed max-w-xl">
                In this step, we’ll ask you what type of space you’re listing and whether guests will book the whole
                place or room. Then tell us the location and how many people it can accommodate
              </p>
            </div>
          )}

          {/* Step 2: Category Selector */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight text-center mb-8">
                Which of these best describes your place?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = category === cat.name
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`flex flex-col items-center justify-center p-4 sm:p-6 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 ${
                        isSelected
                          ? "border-purple-950 dark:border-purple-600 bg-gray-100 dark:bg-muted/40 shadow-sm"
                          : "border-border/80 bg-card"
                      }`}
                    >
                      <Icon className="h-7 w-7 text-foreground mb-3" />
                      <span className="text-xs font-black text-foreground">{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Space Type */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight text-center mb-8">
                What type of place will guests have?
              </h2>
              <div className="space-y-4">
                {/* Option 1: Entire Place */}
                <button
                  type="button"
                  onClick={() => setSpaceType("entire")}
                  className={`w-full text-left p-4 sm:p-6 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 block ${
                    spaceType === "entire"
                      ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <h4 className="text-sm font-black text-foreground">An entire place</h4>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">
                    Guest have the whole place to themselves
                  </p>
                </button>

                {/* Option 2: Private Room */}
                <button
                  type="button"
                  onClick={() => setSpaceType("room")}
                  className={`w-full text-left p-4 sm:p-6 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 block ${
                    spaceType === "room"
                      ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <h4 className="text-sm font-black text-foreground">A room</h4>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">
                    Guest have their own room in their home, plus access to shared place
                  </p>
                </button>

                {/* Option 3: Shared Room */}
                <button
                  type="button"
                  onClick={() => setSpaceType("shared")}
                  className={`w-full text-left p-4 sm:p-6 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 block ${
                    spaceType === "shared"
                      ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <h4 className="text-sm font-black text-foreground">A shared room in a hostel</h4>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">
                    Guests sleep in a shared room in a professionally managed hostel with staffs onsite 24/7
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Location Map */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Where's your place located?
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Your address is only shared with guests after they’ve made a reservation
                </p>
              </div>

              {/* Location Input */}
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <div className="flex items-center gap-3 border border-border/80 bg-card rounded-full px-5 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10 w-full">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search hangout location (e.g. Watford, Paris, London)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0"
                  />
                </div>

                {/* Predefined Location Suggestions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {["Paris", "Watford", "London"].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        location.toLowerCase() === loc.toLowerCase()
                          ? "bg-purple-950 text-white border-purple-950 dark:bg-purple-800 dark:border-purple-800 shadow-sm"
                          : "bg-card text-foreground border-border hover:bg-muted hover:border-gray-400"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Preview widget matching screenshots */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm aspect-video max-w-md mx-auto relative bg-[#e5e3df]">
                {/* Google Maps mock placeholder */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-0.118092,51.509865,12,0/400x200?access_token=mock')`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 shadow-md">
                      <div className="h-3 w-3 rounded-full bg-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Basics */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Share some basics about your place
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  You'll add more details later, like bed types.
                </p>
              </div>

              {/* Basics configuration drawer */}
              <div className="max-w-md mx-auto divide-y divide-border/20">
                {renderCounterRow("Guests", guests, setGuests)}
                {renderCounterRow("Bedroom", bedrooms, setBedrooms)}
                {renderCounterRow("Beds", beds, setBeds)}
                {renderCounterRow("Bathrooms", bathrooms, setBathrooms)}
              </div>
            </div>
          )}

          {/* Step 6: Amenities */}
          {step === 6 && (
            <div className="space-y-8">
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Tell guests what your place has to offer
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  You can add more amenities after you publish your listing.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-black text-foreground">What about these guest favorites?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    "Wifi",
                    "TV",
                    "Kitchen",
                    "Washer",
                    "Free parking on premises",
                    "Paid parking on premises",
                    "Air conditioning",
                    "Dedicated workspace",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`text-left p-5 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 ${
                        amenities.has(item) ? "border-foreground border-2" : "border-border/80 bg-card"
                      }`}
                    >
                      <span className="text-sm font-semibold text-foreground">{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-black text-foreground">Do you have any standout amenities?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    "Pool",
                    "Hot tub",
                    "Patio",
                    "BBQ gril",
                    "Fire pit",
                    "Outdor dining area",
                    "Pool table",
                    "Indoor fireplace",
                    "Piano",
                    "Exercise equipment",
                    "Lake access",
                    "Beach access",
                    "Ski-in/Ski-out",
                    "Outdoor shower",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`text-left p-5 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 ${
                        amenities.has(item) ? "border-foreground border-2" : "border-border/80 bg-card"
                      }`}
                    >
                      <span className="text-sm font-semibold text-foreground">{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-black text-foreground">Do you have any of these safety items?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {["Smoke alarm", "First aid kit", "Carbon monoxide alarm", "Fire extinguisher"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`text-left p-5 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 ${
                        amenities.has(item) ? "border-foreground border-2" : "border-border/80 bg-card"
                      }`}
                    >
                      <span className="text-sm font-semibold text-foreground">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Add Photos */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center mb-6">
                <span className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 6
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Add some photos of your place
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Showcase the atmosphere, layout, and highlights in a polished gallery.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                  >
                    <img src={photo} alt={`Preview ${index + 1}`} className="aspect-4/3 w-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                      Photo {index + 1}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-dashed border-border bg-card px-5 py-3 text-sm font-black text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add a photo
              </button>
            </div>
          )}

          {/* Step 7: Title */}
          {step === 8 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center mb-6">
                <span className="text-sm font-black text-purple-950 uppercase tracking-widest block">Step 7</span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Now, let's give your apartment a title
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Keep it short and sweet! Pick a fun title—you can always tweak it later.
                </p>
              </div>
              <div className="w-full max-w-2xl mx-auto">
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={4}
                  maxLength={32}
                  className="w-full min-h-52 resize-none border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl"
                  placeholder="Input title"
                />
                <p className="mt-2 text-right text-xs font-semibold text-muted-foreground">{title.length}/32</p>
              </div>
            </div>
          )}
          {/* Step 8: Description */}
          {step === 9 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center mb-6">
                <span className="text-sm font-black text-purple-950 uppercase tracking-widest block">Step 8</span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Give a precise description of your apartment.
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Keep it short and sweet! Pick a fun title—you can always tweak it later.
                </p>
              </div>
              <div className="">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={32}
                  className="w-full min-h-52 resize-none border-2 border-foreground px-4 py-3 outline-none placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-purple-600/10 rounded-2xl"
                  placeholder="Input description"
                />
                <p className="mt-2 text-right text-xs font-semibold text-muted-foreground">{description.length}/32</p>
              </div>
            </div>
          )}

          {/* Step 10: Finish Up Intro */}
          {step === 10 && (
            <div className="space-y-6">
              <span className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                Step 10
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                Finish up and publish
              </h1>
              <p className="text-base font-semibold text-muted-foreground leading-relaxed max-w-xl">
                In the final step, you'll select your booking preferences, set your prices, and hit "Publish" to send
                your listing live for guests to see.
              </p>
            </div>
          )}
          {/* Step 11: Booking Setting */}
          {step === 11 && (
            <div className="space-y-6">
              <div className="space-y-1.5 mb-6">
                <span className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 11
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Choose your booking setting
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">You can change this at anytime</p>
              </div>

              <div className="space-y-4 max-w-xl mx-auto">
                <button
                  type="button"
                  onClick={() => setBookingSetting("approve-first")}
                  className={`w-full text-left p-5 sm:p-6 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 block ${
                    bookingSetting === "approve-first"
                      ? "border-purple-950 dark:border-purple-600 bg-gray-50 dark:bg-muted/40 shadow-sm"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-foreground">Start by Approving Your First 5 Bookings</h4>
                    <Calendar className="h-5 w-5 text-foreground shrink-0" />
                  </div>
                  <p className="mt-2 text-xs font-black text-purple-950 dark:text-purple-300">Recommended</p>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    Stay in control early on. After a few guests, switch to Instant Book to let bookings happen
                    automatically
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingSetting("instant")}
                  className={`w-full text-left p-5 sm:p-6 border rounded-2xl transition-[border-color,background-color,transform] duration-160 ease-out cursor-pointer hover:border-gray-400 active:scale-97 block ${
                    bookingSetting === "instant"
                      ? "border-purple-950 dark:border-purple-600 bg-gray-50 dark:bg-muted/40 shadow-sm"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <h4 className="text-base font-black text-foreground">Allow instant booking</h4>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    Guests book automatically without needing approval.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 12: Base Price & Publish (final step) */}
          {step === 12 && (
            <div className="space-y-8 text-center">
              <div className="space-y-1.5">
                <span className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                  Step 12
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Set your base price for the spot
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  For example <span className="font-black text-foreground">$75</span>
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl sm:text-7xl font-black text-foreground">$</span>
                <input
                  type="number"
                  min={1}
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                  className="w-40 border-r border-border/60 bg-transparent text-center text-6xl sm:text-7xl font-black text-foreground outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3 px-8 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out cursor-pointer"
              >
                Publish now
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Footer Actions bar */}
      <footer className="border-t border-border/60 bg-card py-5 px-6 sm:px-8 mt-auto">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-black text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-97 transition-[transform,background-color] duration-160 ease-out"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3 px-6 text-sm shadow-md active:scale-97 transition-[transform,background-color] duration-160 ease-out disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {step === 12 ? "Publish" : "Next"}
          </button>{" "}
        </div>
      </footer>
    </div>
  )
}
