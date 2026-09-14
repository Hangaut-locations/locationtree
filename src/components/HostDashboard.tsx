import {
  Briefcase,
  CalendarDays,
  LogOut,
  User,
  Wallet as WalletIcon,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { HostProfile, Listing, WalletTransaction } from "../types/listing";
import { ListingEditor } from "./ListingEditor";
import { WalletView } from "./WalletView";
import { HostProfilePage } from "./HostProfile";
import AppLayout from "./layout/AppLayout";
import MyListings from "./MyListings";
import NotSignedInWrapper from "./auth/NotSignedInWrapper";

interface HostDashboardProps {
  profile: HostProfile;
  listings: Listing[];
  hostBalance: number;
  guestBalance: number;
  transactions: WalletTransaction[];
  currency: "USD" | "EUR" | "GBP" | "NGN";
  onUpdateProfile: (profile: HostProfile) => void;
  onDeleteListing: (id: string) => void;
  onSaveListing: (listing: Listing) => void;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

type Section = "profile" | "listings" | "wallet";

export const HostDashboard: React.FC<HostDashboardProps> = ({
  profile,
  hostBalance,
  guestBalance,
  transactions,
  currency,
  onUpdateProfile,
  onSaveListing,
  onDeposit,
  onWithdraw,
}) => {
  const [section, setSection] = useState<Section>("profile");
  const [editing, setEditing] = useState<null | {
    listing: Listing | null;
    mode: "party" | "property";
  }>(null);

  const onLogout = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 md:px-8 py-8 space-y-8">
        {/* Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">
                Host dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage your profile, listings and earnings.
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
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
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSection(t.id)}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  section === t.id
                    ? "bg-purple-950 text-white dark:bg-purple-800"
                    : "bg-muted/15 text-purple-950 dark:text-purple-300 hover:bg-muted/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <NotSignedInWrapper>
          {/* PROFILE SECTION */}
          {section === "profile" && (
            <HostProfilePage
              profile={profile}
              onUpdateProfile={onUpdateProfile}
            />
          )}

          {/* LISTINGS SECTION */}
          {section === "listings" && <MyListings />}

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
        </NotSignedInWrapper>
      </div>
    </AppLayout>
  );
};
