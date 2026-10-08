import { useNavigate } from "react-router-dom";
import { Navbar } from "../Navbar";
import { AuthModal } from "../AuthModal";
import { Footer } from "../Footer";
import { SideMenu } from "../SideMenu";
import useAuth from "../hooks/useAuth";
import useAppContext from "../hooks/useAppContext";
import { CurrencyModal } from "../CurrencyModal";
import { logout } from "../../lib/session";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { data } = useAuth();
  const {
    isSideMenu,
    setIsSideMenu,
    setIsAuthModal,
    isCurrencyModal,
    setIsCurrencyModal,
    currency,
    setCurrency,
  } = useAppContext();
  const isLoggedIn = Boolean(data);
  const viewMode = window.location.pathname.includes("host") ? "host" : "guest";

  const goTo = (path: string) => {
    setIsSideMenu(false);
    navigate(path);
  };

  const menuCallbacks = {
    onWallet: () => goTo(viewMode === "host" ? "/host" : "/wallet"),
    onHostEarnings: () => goTo("/host"),
    onGuestPayments: () => goTo("/wallet"),
    onWishlist: () => goTo("/wishlist"),
    onProfile: () => goTo("/profile"),
    onCurrency: () => {
      setIsSideMenu(false);
      setIsCurrencyModal(true);
    },
    onTrips: () => goTo("/reservations?tab=trips"),
    onReservations: () =>
      goTo(`/reservations?tab=${viewMode === "host" ? "hosting" : "trips"}`),
    onSwitchView: () => goTo(viewMode === "host" ? "/" : "/host"),
    onSupport: () => goTo("/support"),
    onLogin: () => {
      setIsSideMenu(false);
      setIsAuthModal(true);
    },
    onLogout: () => {
      setIsSideMenu(false);
      logout();
    },
    onClose: () => setIsSideMenu(false),
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow">{children}</main>
      <Footer
        currency={currency}
        onCurrencyClick={() => setIsCurrencyModal(true)}
      />

      {/* <FilterModal
      // isOpen={isFilterModalOpen}
      // onClose={() => setIsFilterModalOpen(false)}
      // filters={filters}
      // onApply={handleFilterApply}
      // filteredCount={filteredListings.length}
      /> */}

      <AuthModal />

      <CurrencyModal
        isOpen={isCurrencyModal}
        onClose={() => setIsCurrencyModal(false)}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      <SideMenu
        isOpen={isSideMenu}
        isLoggedIn={isLoggedIn}
        viewMode={viewMode}
        currency={currency}
        callbacks={menuCallbacks}
      />
    </div>
  );
};

export default AppLayout;
