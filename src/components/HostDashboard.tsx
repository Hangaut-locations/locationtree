import {
  Briefcase,
  CalendarDays,
  LogOut,
  PartyPopper,
  Pencil,
  Plus,
  Trash2,
  User,
  Wallet as WalletIcon,
} from "lucide-react"
import type React from "react"
import { useState } from "react"
import { DEFAULT_HOST_AVATAR } from "../data/constants"
import type { HostProfile, Listing, WalletTransaction } from "../types/listing"
import { ListingEditor } from "./ListingEditor"
import { WalletView } from "./WalletView"

interface HostDashboardProps {
  profile: HostProfile
  listings: Listing[]
  hostBalance: number
  guestBalance: number
  transactions: WalletTransaction[]
  currency: "USD" | "EUR" | "GBP" | "NGN"
  onUpdateProfile: (profile: HostProfile) => void
  onDeleteListing: (id: string) => void
  onSaveListing: (listing: Listing) => void
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
  onLogout: () => void
}

type Section = "profile" | "listings" | "wallet"

export const HostDashboard: React.FC<HostDashboardProps> = ({
  profile,
  listings,
  hostBalance,
  guestBalance,
  transactions,
  currency,
  onUpdateProfile,
  onDeleteListing,
  onSaveListing,
  onDeposit,
  onWithdraw,
  onLogout,
}) => {
  const [section, setSection] = useState<Section>("profile")
  const [editing, setEditing] = useState<null | { listing: Listing | null; mode: "party" | "property" }>(null)

  const partyListings = listings.filter((l) => l.hostingType === "party")
  const propertyListings = listings.filter((l) => l.hostingType !== "party")

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 space-y-8">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Host dashboard</h1>
            <p className="text-sm font-semibold text-muted-foreground">Manage your profile, listings and earnings.</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-black text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-4 overflow-x-auto">
        {(
          [
            { id: "profile", label: "Profile", icon: User },
            { id: "listings", label: "My listings", icon: CalendarDays },
            { id: "wallet", label: "Wallet", icon: WalletIcon },
          ] as const
        ).map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-black transition-all cursor-pointer ${
                section === t.id
                  ? "bg-purple-950 text-white dark:bg-purple-800"
                  : "bg-muted/15 text-purple-950 dark:text-purple-300 hover:bg-muted/30"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* PROFILE SECTION */}
      {section === "profile" && (
        <div className="rounded-[28px] border border-border bg-card p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Click avatar to edit profile */}
            <button
              onClick={() => setSection("listings")}
              className="relative group shrink-0 cursor-pointer"
              aria-label="Edit profile"
            >
              <img
                src={profile.avatar || DEFAULT_HOST_AVATAR}
                alt="Host profile"
                className="h-28 w-28 rounded-full object-cover border-4 border-purple-950/10"
              />
              <span className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-purple-950 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Pencil className="h-4 w-4" />
              </span>
            </button>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black text-foreground tracking-tight">{profile.name || "Your name"}</h2>
              <p className="text-sm font-semibold text-muted-foreground">
                {profile.location ? `${profile.location} · ` : ""}
                {profile.phone || "add phone"}
              </p>
              <button
                onClick={() => setSection("listings")}
                className="mt-3 rounded-full border border-border px-5 py-2 text-sm font-black text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Edit profile
              </button>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Full name</span>
                <input
                  defaultValue={profile.name}
                  onBlur={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
                  placeholder="Introduce yourself — full name"
                  className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Location</span>
                <input
                  defaultValue={profile.location}
                  onBlur={(e) => onUpdateProfile({ ...profile, location: e.target.value })}
                  placeholder="City"
                  className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Phone number</span>
                <input
                  defaultValue={profile.phone}
                  onBlur={(e) => onUpdateProfile({ ...profile, phone: e.target.value })}
                  placeholder="+44 …"
                  className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground">About me / Bio</span>
              <textarea
                defaultValue={profile.bio}
                onBlur={(e) => onUpdateProfile({ ...profile, bio: e.target.value })}
                rows={4}
                placeholder="Tell guests a little about yourself and what you love hosting…"
                className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-purple-600"
              />
            </label>

            <p className="text-[11px] font-semibold text-muted-foreground">
              Tip: click your profile picture to edit your profile. Changes save as you type out of each field.
            </p>
          </div>
        </div>
      )}

      {/* LISTINGS SECTION */}
      {section === "listings" && (
        <div className="space-y-6">
          {/* Add new */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setEditing({ listing: null, mode: "party" })}
              className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-6 text-left hover:border-purple-950/40 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="h-12 w-12 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PartyPopper className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-base font-black text-foreground">Host a new party</p>
                <p className="text-xs font-semibold text-muted-foreground">Add a new party listing</p>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setEditing({ listing: null, mode: "property" })}
              className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-6 text-left hover:border-purple-950/40 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="h-12 w-12 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-base font-black text-foreground">List a new property</p>
                <p className="text-xs font-semibold text-muted-foreground">Add a place / spot for events</p>
              </div>
              <Plus className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-black text-foreground">You have no listings yet</p>
              <p className="text-xs font-semibold text-muted-foreground mt-1">
                Add a party or property to start earning.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {partyListings.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-black text-foreground uppercase tracking-wider">Your parties</p>
                  {partyListings.map((l) => (
                    <ListingRow
                      key={l.id}
                      listing={l}
                      onEdit={() => setEditing({ listing: l, mode: "party" })}
                      onDelete={() => onDeleteListing(l.id)}
                    />
                  ))}
                </div>
              )}
              {propertyListings.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-black text-foreground uppercase tracking-wider">Your properties</p>
                  {propertyListings.map((l) => (
                    <ListingRow
                      key={l.id}
                      listing={l}
                      onEdit={() => setEditing({ listing: l, mode: "property" })}
                      onDelete={() => onDeleteListing(l.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* WALLET SECTION */}
      {section === "wallet" && (
        <WalletView
          mode="host"
          hostBalance={hostBalance}
          guestBalance={guestBalance}
          transactions={transactions}
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          currency={currency}
        />
      )}

      {editing && (
        <ListingEditor
          isOpen
          mode={editing.mode}
          listing={editing.listing}
          onClose={() => setEditing(null)}
          onSave={onSaveListing}
        />
      )}
    </div>
  )
}

const ListingRow: React.FC<{
  listing: Listing
  onEdit: () => void
  onDelete: () => void
}> = ({ listing, onEdit, onDelete }) => {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
      <img src={listing.images[0]} alt={listing.title} className="h-16 w-16 rounded-2xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-foreground truncate">{listing.title}</p>
        <p className="text-[11px] font-semibold text-muted-foreground">
          {listing.location} · {listing.guestsCount} guests · ${listing.price}/{listing.priceUnit}
          {listing.hostingType === "party" && listing.startDate && listing.endDate
            ? ` · ${listing.startDate} → ${listing.endDate}`
            : ""}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors cursor-pointer"
        aria-label="Edit listing"
      >
        <Pencil className="h-4 w-4 text-foreground" />
      </button>
      <button
        onClick={onDelete}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        aria-label="Delete listing"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
