import {
  Briefcase,
  CreditCard,
  DollarSign,
  Globe,
  Heart,
  Home,
  LifeBuoy,
  LogIn,
  LogOut,
  Plane,
  Settings2,
  User,
  Wallet as WalletIcon,
} from "lucide-react"
import type React from "react"
import type { CurrencyCode } from "../lib/currency"

export interface SideMenuCallbacks {
  onWallet: () => void
  onHostEarnings: () => void
  onGuestPayments: () => void
  onWishlist: () => void
  onProfile: () => void
  onCurrency: () => void
  onTrips: () => void
  onSupport: () => void
  onLogin: () => void
  onLogout: () => void
  onClose: () => void
}

interface SideMenuProps {
  isOpen: boolean
  isLoggedIn: boolean
  viewMode: "guest" | "host"
  currency: CurrencyCode
  callbacks: SideMenuCallbacks
}

interface MenuItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  hint?: string
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, isLoggedIn, viewMode, currency, callbacks }) => {
  if (!isOpen) return null

  const guestItems: MenuItem[] = [
    { label: "Wallet & Payments", icon: WalletIcon, onClick: callbacks.onWallet },
    { label: "Booked Trips", icon: Plane, onClick: callbacks.onTrips },
    { label: "Wish/Lived list", icon: Heart, onClick: callbacks.onWishlist },
    {
      label: "Language and Currency",
      icon: Globe,
      onClick: callbacks.onCurrency,
      hint: `English (US) · ${currency}`,
    },
    { label: "Profile", icon: User, onClick: callbacks.onProfile },
    { label: "Contact support", icon: LifeBuoy, onClick: callbacks.onSupport },
  ]

  const hostItems: MenuItem[] = [
    { label: "Wallet", icon: WalletIcon, onClick: callbacks.onWallet, hint: "Deposit & pay for bookings" },
    { label: "Host Earnings", icon: DollarSign, onClick: callbacks.onHostEarnings, hint: "Withdraw to bank" },
    { label: "Guest Payments", icon: CreditCard, onClick: callbacks.onGuestPayments },
    { label: "Wish/Lived list", icon: Heart, onClick: callbacks.onWishlist },
    {
      label: "Language and Currency",
      icon: Globe,
      onClick: callbacks.onCurrency,
      hint: `English (US) · ${currency}`,
    },
    { label: "Profile & Bio", icon: User, onClick: callbacks.onProfile },
    { label: "Booked Trips", icon: Plane, onClick: callbacks.onTrips },
    { label: "Contact support", icon: LifeBuoy, onClick: callbacks.onSupport },
  ]

  const renderList = (title: string, list: MenuItem[]) => (
    <div className="space-y-1.5">
      <p className="px-4 pt-4 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      {list.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Icon className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.hint && <span className="text-[11px] font-semibold text-muted-foreground">{item.hint}</span>}
          </button>
        )
      })}
    </div>
  )

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] animate-in fade-in duration-200"
        onClick={callbacks.onClose}
      />
      {/* Drawer panel */}
      <div className="fixed top-0 left-0 z-50 h-full w-[320px] max-w-[85vw] bg-card border-r border-border shadow-2xl overflow-y-auto animate-in slide-in-from-left-40 duration-200 flex flex-col">
        {/* Header with title */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/60">
          <span className="text-sm font-black text-foreground">Menu</span>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {viewMode === "host" ? "Host account" : "Guest account"}
          </span>
        </div>

        <div className="flex-1 pb-4">
          {/* Account status */}
          <div className="md:hidden px-4 pt-4">
            {isLoggedIn ? (
              <button
                onClick={callbacks.onLogout}
                className="w-full flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Log out</span>
              </button>
            ) : (
              <button
                onClick={callbacks.onLogin}
                className="w-full flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <LogIn className="h-4.5 w-4.5" />
                <span>Log in</span>
              </button>
            )}
          </div>

          {renderList(
            viewMode === "host" ? "Hosting" : "General",
            viewMode === "host"
              ? [
                  {
                    label: "Manage listings",
                    icon: Home,
                    onClick: callbacks.onHostEarnings, // routed to host dashboard
                  },
                  ...hostItems.slice(0, 6),
                ]
              : guestItems.slice(0, 6),
          )}

          {renderList(viewMode === "host" ? "Account" : "Account", [
            { label: "Settings", icon: Settings2, onClick: callbacks.onProfile },
            {
              label: "Switch to " + (viewMode === "host" ? "Guest" : "Host"),
              icon: viewMode === "host" ? User : Briefcase,
              onClick: callbacks.onProfile, // handled by navbar switcher
            },
            { label: "Contact support", icon: LifeBuoy, onClick: callbacks.onSupport },
          ])}
        </div>
      </div>
    </>
  )
}
