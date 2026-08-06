import { useEffect, useState } from "react"
import "./App.css"
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom"
import { AuthModal } from "./components/AuthModal"
import { BecomeHostWizard } from "./components/BecomeHostWizard"
import { CategorySlider } from "./components/CategorySlider"
import { CurrencyModal } from "./components/CurrencyModal"
import type { FilterState } from "./components/FilterModal"
import { FilterModal } from "./components/FilterModal"
import { Footer } from "./components/Footer"
import { HostChooser } from "./components/HostChooser"
import { HostDashboard } from "./components/HostDashboard"
import { ListingDetail } from "./components/ListingDetail"
import { ListingGrid } from "./components/ListingGrid"
import { Navbar } from "./components/Navbar"
import { PartyWizard } from "./components/PartyWizard"
import { ProfilePage } from "./components/ProfilePage"
import { SearchHeader } from "./components/SearchHeader"
import { SideMenu } from "./components/SideMenu"
import { SupportPage } from "./components/SupportPage"
import { TripsPage } from "./components/TripsPage"
import { WalletView } from "./components/WalletView"
import { WishlistPage } from "./components/WishlistPage"
import { PARTY_TYPES } from "./data/constants"
import { locationListings, planningListings } from "./data/listings"
import type { CurrencyCode } from "./lib/currency"
import { loadState, saveState } from "./lib/storage"
import type { Booking, HostProfile, Listing, Wallet, WalletTransaction } from "./types/listing"

const DEFAULT_PROFILE: HostProfile = {
  name: "Adaeze Okafor",
  location: "London",
  phone: "+44 7700 900123",
  bio: "I love hosting unforgettable rooftop parties and events across the city.",
  avatar: "",
}

const DEFAULT_WALLET: Wallet = {
  balance: 1560,
  transactions: [],
}

// Full-screen wizard routes that render without the main navbar/footer.
const WIZARD_PATHS = ["/become-a-host", "/become-a-host/party", "/become-a-host/property"]

function App() {
  const [activeTab, setActiveTab] = useState<"location" | "planning">("location")
  const [activeCategory, setActiveCategory] = useState<string>("Rooftops")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [checkIn, setCheckIn] = useState<string>("")
  const [checkOut, setCheckOut] = useState<string>("")
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false)

  // Account state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>("")
  const [viewMode, setViewMode] = useState<"guest" | "host">("guest")
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false)
  const [currencyOpen, setCurrencyOpen] = useState<boolean>(false)

  // Currency (persisted) — mock conversion API; all prices stored in USD.
  const [currency, setCurrency] = useState<CurrencyCode>(() => loadState<CurrencyCode>("currency", "USD"))

  // Host profile (persisted)
  const [profile, setProfile] = useState<HostProfile>(() => loadState<HostProfile>("host-profile", DEFAULT_PROFILE))

  // Wallet (persisted)
  const [wallet, setWallet] = useState<Wallet>(() => loadState<Wallet>("wallet", DEFAULT_WALLET))

  // Bookings (persisted)
  const [bookings, setBookings] = useState<Booking[]>(() => loadState<Booking[]>("bookings", []))

  // Listings List State initialized with the static mock data
  const [listingsList, setListingsList] = useState<Listing[]>(() => [...locationListings, ...planningListings])

  const navigate = useNavigate()
  const location = useLocation()
  const isWizardRoute = WIZARD_PATHS.includes(location.pathname)

  // Detailed Filter State
  const [filters, setFilters] = useState<FilterState>({
    placeType: "any",
    minPrice: 50,
    maxPrice: 1200,
    bedrooms: 1,
    beds: 1,
    adults: 1,
    children: 1,
    pets: 1,
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("wishlist")
    return saved ? JSON.parse(saved) : []
  })

  // Persist account-dependent state
  useEffect(() => saveState("currency", currency), [currency])
  useEffect(() => saveState("host-profile", profile), [profile])
  useEffect(() => saveState("wallet", wallet), [wallet])
  useEffect(() => saveState("bookings", bookings), [bookings])
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist))
  }, [wishlist])

  // Wishlist toggle
  const handleWishlistToggle = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const defaultCategoryFor = (tab: "location" | "planning") =>
    tab === "planning" ? (PARTY_TYPES[0] as string) : "Rooftops"

  // Run mock loading state and set search parameters
  const handleSearchSubmit = (searchParams: { destination: string; checkIn: string; checkOut: string }) => {
    setIsLoading(true)
    setSearchQuery(searchParams.destination)
    setCheckIn(searchParams.checkIn)
    setCheckOut(searchParams.checkOut)

    setTimeout(() => {
      setIsLoading(false)
    }, 550)
  }

  const handleCategorySelect = (category: string) => {
    setIsLoading(true)
    setActiveCategory(category)
    setTimeout(() => {
      setIsLoading(false)
    }, 450)
  }

  const handleFilterApply = (appliedFilters: FilterState) => {
    setIsLoading(true)
    setFilters(appliedFilters)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  const handleTabChange = (tab: "location" | "planning") => {
    setIsLoading(true)
    setActiveTab(tab)
    navigate("/")
    setActiveCategory(defaultCategoryFor(tab))
    setSearchQuery("")
    setCheckIn("")
    setCheckOut("")
    setFilters({
      placeType: "any",
      minPrice: 50,
      maxPrice: 1200,
      bedrooms: 1,
      beds: 1,
      adults: 1,
      children: 1,
      pets: 1,
    })
    setTimeout(() => {
      setIsLoading(false)
    }, 450)
  }

  const handleResetFilters = () => {
    setIsLoading(true)
    navigate("/")
    setActiveCategory(defaultCategoryFor(activeTab))
    setSearchQuery("")
    setCheckIn("")
    setCheckOut("")
    setFilters({
      placeType: "any",
      minPrice: 50,
      maxPrice: 1200,
      bedrooms: 1,
      beds: 1,
      adults: 1,
      children: 1,
      pets: 1,
    })
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  // --- Account actions ---
  const handleLoginSuccess = (email: string) => {
    setIsLoggedIn(true)
    setUserName(email.split("@")[0] || "guest")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName("")
    setViewMode("guest")
    navigate("/")
  }

  const handleSwitchView = (mode: "guest" | "host") => {
    setViewMode(mode)
    navigate(mode === "host" ? "/host" : "/")
  }

  const handleBecomeHostClick = () => {
    if (!isLoggedIn) {
      setIsAuthOpen(true)
      return
    }
    navigate("/become-a-host")
  }

  // --- Listing actions ---
  const handleAddNewListing = (newListing: Listing) => {
    setListingsList((prev) => [newListing, ...prev])
  }

  const handleSaveListing = (updated: Listing) => {
    setListingsList((prev) =>
      prev.some((l) => l.id === updated.id) ? prev.map((l) => (l.id === updated.id ? updated : l)) : [updated, ...prev],
    )
  }

  const handleDeleteListing = (id: string) => {
    setListingsList((prev) => prev.filter((l) => l.id !== id))
  }

  // --- Wallet actions ---
  const pushTransaction = (label: string, amount: number, type: "credit" | "debit"): WalletTransaction => ({
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString().slice(0, 10),
    label,
    amount,
    type,
  })

  const handleDeposit = (amount: number) => {
    setWallet((prev) => ({
      balance: prev.balance + amount,
      transactions: [pushTransaction(`Deposit to wallet`, amount, "credit"), ...prev.transactions],
    }))
  }

  const handleWithdraw = (amount: number) => {
    setWallet((prev) => ({
      balance: Math.max(0, prev.balance - amount),
      transactions: [pushTransaction(`Withdraw to bank`, amount, "debit"), ...prev.transactions],
    }))
  }

  const handleReserve = (listing: Listing, total: number) => {
    const booking: Booking = {
      id: `booking-${Date.now()}`,
      listingId: listing.id,
      title: listing.title,
      location: listing.location,
      image: listing.images[0],
      date: new Date().toISOString().slice(0, 10),
      guests: listing.guestsCount,
      total,
    }
    setBookings((prev) => [booking, ...prev])
    // Reserve the guest's wallet funds.
    setWallet((prev) => ({
      balance: Math.max(0, prev.balance - total),
      transactions: [pushTransaction(`Booking: ${listing.title}`, total, "debit"), ...prev.transactions],
    }))
    alert(`Reserved "${listing.title}" — see your Booked Trips.`)
  }

  // Determine active datasource based on selected tab, including newly created listings.
  // Location tab: stays + user-listed properties. Planning tab: party listings + mock planning spaces.
  const planningIds = new Set(planningListings.map((p) => p.id))
  const activeListingsSource =
    activeTab === "location"
      ? listingsList.filter((l) => l.hostingType !== "party" && !planningIds.has(l.id))
      : listingsList.filter((l) => l.hostingType === "party" || planningIds.has(l.id))

  // Filtering Logic
  const filteredListings = activeListingsSource.filter((listing) => {
    // 1. Category Filter
    if (activeCategory && listing.category !== activeCategory) {
      return false
    }

    // 2. Search Query (Destination) Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      const locationMatch = listing.location.toLowerCase().includes(query)
      const titleMatch = listing.title.toLowerCase().includes(query)
      if (!locationMatch && !titleMatch) {
        return false
      }
    }

    // 3. Place Type Filter
    if (filters.placeType !== "any") {
      const titleLower = listing.title.toLowerCase()
      if (filters.placeType === "room") {
        const isRoom = titleLower.includes("room") || titleLower.includes("suite")
        if (!isRoom) return false
      } else if (filters.placeType === "entire") {
        const isEntire =
          titleLower.includes("apartment") ||
          titleLower.includes("cabin") ||
          titleLower.includes("condo") ||
          titleLower.includes("hotel") ||
          titleLower.includes("guesthouse") ||
          titleLower.includes("studios") ||
          titleLower.includes("reserve") ||
          titleLower.includes("stay")
        if (!isEntire) return false
      }
    }

    // 4. Price range Filter
    if (listing.price < filters.minPrice || listing.price > filters.maxPrice) {
      return false
    }

    // 5. Rooms and beds Count Filter (only meaningful for properties / non-party listings)
    if (listing.hostingType !== "party") {
      if (listing.bedroomsCount < filters.bedrooms) {
        return false
      }
      if (listing.bedsCount < filters.beds) {
        return false
      }
    }

    // 6. People capacity (Adults + Children) Filter
    const totalPeopleRequired = filters.adults + filters.children
    if (listing.guestsCount < totalPeopleRequired) {
      return false
    }

    return true
  })

  const ownedListings = listingsList.filter((l) => l.isOwnedByUser)

  // Modal navigation handlers
  const goTo = (path: string) => {
    setSideMenuOpen(false)
    navigate(path)
  }

  const menuCallbacks = {
    onWallet: () => goTo(viewMode === "host" ? "/host" : "/wallet"),
    onHostEarnings: () => goTo("/host"),
    onGuestPayments: () => goTo("/wallet"),
    onWishlist: () => goTo("/wishlist"),
    onProfile: () => goTo("/profile"),
    onCurrency: () => {
      setSideMenuOpen(false)
      setCurrencyOpen(true)
    },
    onTrips: () => goTo("/trips"),
    onSupport: () => goTo("/support"),
    onLogin: () => {
      setSideMenuOpen(false)
      setIsAuthOpen(true)
    },
    onLogout: () => {
      setSideMenuOpen(false)
      handleLogout()
    },
    onClose: () => setSideMenuOpen(false),
  }

  // Listing Detail Wrapper component using hook params
  const ListingDetailWrapper = () => {
    const { id } = useParams<{ id: string }>()
    const listing = listingsList.find((l) => l.id === id)

    if (!listing) {
      return (
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h3 className="text-xl font-bold text-foreground">Listing not found</h3>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 rounded-full bg-purple-950 text-white px-6 py-2.5 font-bold cursor-pointer"
          >
            Back to home
          </button>
        </div>
      )
    }

    return (
      <ListingDetail
        listing={listing}
        onBack={() => navigate("/")}
        onWishlistToggle={handleWishlistToggle}
        isWishlisted={wishlist.includes(listing.id)}
        currency={currency}
        onReserve={handleReserve}
      />
    )
  }

  const renderMainPage = () => {
    // Main routes render with the shared stock navbar/footer + side menu/modal overlays
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onLoginClick={() => setIsAuthOpen(true)}
          isLoggedIn={isLoggedIn}
          userName={userName}
          viewMode={viewMode}
          onSwitchView={handleSwitchView}
          onBecomeHostClick={handleBecomeHostClick}
          onMenuClick={() => setSideMenuOpen(true)}
          onProfileClick={() => navigate("/profile")}
          onLogoutClick={handleLogout}
          currency={currency}
        />

        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <SearchHeader
                    activeSearch={{ destination: searchQuery, checkIn, checkOut }}
                    onSearch={handleSearchSubmit}
                    onFilterClick={() => setIsFilterModalOpen(true)}
                  />

                  <CategorySlider
                    activeCategory={activeCategory}
                    activeTab={activeTab}
                    onSelectCategory={handleCategorySelect}
                  />

                  <ListingGrid
                    listings={filteredListings}
                    isLoading={isLoading}
                    wishlist={wishlist}
                    onWishlistToggle={handleWishlistToggle}
                    onResetFilters={handleResetFilters}
                    activeDestination={searchQuery}
                    activeCategory={activeCategory}
                    activeTab={activeTab}
                    onListingClick={(listing) => navigate(`/listing/${listing.id}`)}
                    currency={currency}
                  />
                </>
              }
            />
            <Route path="/listing/:id" element={<ListingDetailWrapper />} />
            <Route
              path="/host"
              element={
                <HostDashboard
                  profile={profile}
                  listings={ownedListings}
                  hostBalance={wallet.balance}
                  guestBalance={wallet.balance}
                  transactions={wallet.transactions}
                  currency={currency}
                  onUpdateProfile={setProfile}
                  onDeleteListing={handleDeleteListing}
                  onSaveListing={handleSaveListing}
                  onDeposit={handleDeposit}
                  onWithdraw={handleWithdraw}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="/wishlist"
              element={
                <WishlistPage
                  listings={listingsList}
                  wishlist={wishlist}
                  onWishlistToggle={handleWishlistToggle}
                  onListingClick={(listing) => navigate(`/listing/${listing.id}`)}
                  currency={currency}
                />
              }
            />
            <Route path="/trips" element={<TripsPage bookings={bookings} currency={currency} />} />
            <Route
              path="/wallet"
              element={
                <WalletView
                  mode={viewMode === "host" ? "host" : "guest"}
                  hostBalance={wallet.balance}
                  guestBalance={wallet.balance}
                  transactions={wallet.transactions}
                  onDeposit={handleDeposit}
                  onWithdraw={handleWithdraw}
                  currency={currency}
                />
              }
            />
            <Route path="/profile" element={<ProfilePage profile={profile} onUpdateProfile={setProfile} />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<div className="mx-auto max-w-7xl px-6 py-16 text-center" />} />
          </Routes>
        </main>

        <Footer currency={currency} onCurrencyClick={() => setCurrencyOpen(true)} />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onApply={handleFilterApply}
          filteredCount={filteredListings.length}
        />

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />

        <CurrencyModal
          isOpen={currencyOpen}
          onClose={() => setCurrencyOpen(false)}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        <SideMenu
          isOpen={sideMenuOpen}
          isLoggedIn={isLoggedIn}
          viewMode={viewMode}
          currency={currency}
          callbacks={menuCallbacks}
        />
      </div>
    )
  }

  // Host wizard step-flow renders in isolation, without the stock navbar/footer.
  const wizardRoutes = (
    <Routes>
      <Route
        path="/become-a-host"
        element={
          <HostChooser
            onBack={() => navigate("/")}
            onParty={() => navigate("/become-a-host/party")}
            onProperty={() => navigate("/become-a-host/property")}
          />
        }
      />
      <Route path="/become-a-host/party" element={<PartyWizard onAddListing={handleAddNewListing} />} />
      <Route path="/become-a-host/property" element={<BecomeHostWizard onAddListing={handleAddNewListing} />} />
    </Routes>
  )

  if (isWizardRoute) {
    return wizardRoutes
  }

  return renderMainPage()
}

export default App
