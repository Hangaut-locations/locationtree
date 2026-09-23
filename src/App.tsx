import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { HostPropertyWizard } from "./components/HostPropertyWizard";
import { HostChooser } from "./components/HostChooser";
import { HostDashboard } from "./components/HostDashboard";
import { PartyWizard } from "./components/PartyWizard";
import { ProfilePage } from "./components/ProfilePage";
import { SupportPage } from "./components/SupportPage";
import { TripsPage } from "./components/TripsPage";
import { WalletView } from "./components/WalletView";
import { FavoritesPage } from "./components/FavoritesPage";
import { locationListings, planningListings } from "./data/listings";
import type { CurrencyCode } from "./lib/currency";
import { loadState } from "./lib/storage";
import type {
  Booking,
  HostProfile,
  Listing,
  Wallet,
  WalletTransaction,
} from "./types/listing";
import AllPage from "./pages/All.page";
import PartiesPage from "./pages/PartyLists.page";
import PartyDetailPage from "./pages/PartyDetail.page";
import "./App.css";

const DEFAULT_PROFILE: HostProfile = {
  name: "Adaeze Okafor",
  location: "surulere",
  phone: "+44 7700 900123",
  bio: "I love hosting unforgettable rooftop parties and events across the city.",
  avatar: "",
  email: "",
};

const DEFAULT_WALLET: Wallet = {
  balance: 1560,
  transactions: [],
};

function App() {
  const [activeTab, setActiveTab] = useState<"location" | "planning">(
    "location",
  );

  // Account state
  const [viewMode, setViewMode] = useState<"guest" | "host">("guest");
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false);

  // Currency (persisted) — mock conversion API; all prices stored in USD.
  const [currency, setCurrency] = useState<CurrencyCode>(() =>
    loadState<CurrencyCode>("currency", "USD"),
  );

  // Host profile (persisted)
  const [profile, setProfile] = useState<HostProfile>(() =>
    loadState<HostProfile>("host-profile", DEFAULT_PROFILE),
  );

  // Wallet (persisted)
  const [wallet, setWallet] = useState<Wallet>(() =>
    loadState<Wallet>("wallet", DEFAULT_WALLET),
  );

  // Bookings (persisted)
  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadState<Booking[]>("bookings", []),
  );

  // Listings List State initialized with the static mock data
  const [listingsList, setListingsList] = useState<Listing[]>(() => [
    ...locationListings,
    ...planningListings,
  ]);

  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist toggle
  const handleWishlistToggle = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // --- Listing actions ---
  const handleAddNewListing = (newListing: Listing) => {
    setListingsList((prev) => [newListing, ...prev]);
  };

  const handleSaveListing = (updated: Listing) => {
    setListingsList((prev) =>
      prev.some((l) => l.id === updated.id)
        ? prev.map((l) => (l.id === updated.id ? updated : l))
        : [updated, ...prev],
    );
  };

  const handleDeleteListing = (id: string) => {
    setListingsList((prev) => prev.filter((l) => l.id !== id));
  };

  // --- Wallet actions ---
  const pushTransaction = (
    label: string,
    amount: number,
    type: "credit" | "debit",
  ): WalletTransaction => ({
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString().slice(0, 10),
    label,
    amount,
    type,
  });

  const handleDeposit = (amount: number) => {
    setWallet((prev) => ({
      balance: prev.balance + amount,
      transactions: [
        pushTransaction(`Deposit to wallet`, amount, "credit"),
        ...prev.transactions,
      ],
    }));
  };

  const handleWithdraw = (amount: number) => {
    setWallet((prev) => ({
      balance: Math.max(0, prev.balance - amount),
      transactions: [
        pushTransaction(`Withdraw to bank`, amount, "debit"),
        ...prev.transactions,
      ],
    }));
  };

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
    };
    setBookings((prev) => [booking, ...prev]);
    // Reserve the guest's wallet funds.
    setWallet((prev) => ({
      balance: Math.max(0, prev.balance - total),
      transactions: [
        pushTransaction(`Booking: ${listing.title}`, total, "debit"),
        ...prev.transactions,
      ],
    }));
    alert(`Reserved "${listing.title}" — see your Booked Trips.`);
  };

  const ownedListings = listingsList.filter((l) => l.isOwnedByUser);

  return (
    <Routes>
      <Route path="/" element={<AllPage />} />
      <Route path="/parties" element={<PartiesPage />} />
      <Route path="/parties/:id" element={<PartyDetailPage />} />
      <Route path="/homes" element={<PartiesPage />} />
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
      <Route path="/become-a-host/party" element={<PartyWizard />} />
      <Route
        path="/become-a-host/property"
        element={<HostPropertyWizard onAddListing={handleAddNewListing} />}
      />

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
            // onLogout={handleLogout}
          />
        }
      />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/wishlist" element={<FavoritesPage />} />
      <Route
        path="/trips"
        element={<TripsPage bookings={bookings} currency={currency} />}
      />
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
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route
        path="*"
        element={<div className="mx-auto max-w-7xl px-6 py-16 text-center" />}
      />
    </Routes>
  );
}

export default App;
