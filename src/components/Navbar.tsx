import { Briefcase, Heart, LogIn, Menu, User } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { CurrencyCode } from "../lib/currency";
import { useNavigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import useAppContext from "./hooks/useAppContext";
import { AllIcon, HomeIcon, PartiesIcon } from "./svgs";
import { SearchHeader } from "./SearchHeader";

interface NavbarProps {
  currency?: CurrencyCode;
}

export const Navbar: React.FC<NavbarProps> = ({ currency = "NGN" }) => {
  const { data, isLoading } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isActive, setIsActive] = useState<"all" | "homes" | "parties">("all");
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = window.location.pathname;

  const tabs = ["all", "parties", "homes"] as const;

  const handleSetActive = (link: "all" | "homes" | "parties") => {
    navigate(link === "all" ? "/" : `/${link}`);
    setIsActive(link);
  };

  const avatar =
    data && data?.firstName
      ? data?.firstName.split(" ")[0][0] + data?.lastName.split(" ")[0][0]
      : "G";

  const displayName =
    data && data?.firstName
      ? data?.firstName
      : location.includes("host")
        ? "Host"
        : "Guest";

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isActive !== "all" && location === "/") {
      setIsActive("all");
    }
  }, [isActive]);

  // Hydrate the local state with the current location
  useEffect(() => {
    const matchedTab = tabs.find((tab) => location.includes(tab));

    if (matchedTab) {
      setIsActive(matchedTab);
    } else {
      setIsActive("all");
    }
  }, [location]);

  return (
    <header className="sticky  top-0 z-40 w-full border-b-2 border-gray-200 bg-[#FBFBFB] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex flex-col lg:flex-row lg:h-20 max-w-7xl items-center justify-between px-4 lg:px-8 py-4 lg:py-0 gap-4 lg:gap-0">
        {/* Top Row for Mobile (Logo + Controls) / Left Column for Desktop */}
        <div className="flex w-full lg:w-auto items-center justify-between lg:justify-start gap-4">
          {/* Menu button (opens settings side menu) */}
          <button
            // onClick={onMenuClick}
            className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2.5 shadow-sm hover:shadow-md active:scale-97 transition-all cursor-pointer bg-card"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 text-foreground" />
            {/* <h2>{avatar}</h2> */}
            {/* {data && (
              <img
                src={avatar}
                alt="Account"
                className="h-6 w-6 rounded-full object-cover hidden sm:block"
              />
            )} */}
            {/* <div className="flex justify-center items-center w-max font-semibold text-sm uppercase">
              {avatar}
            </div> */}
          </button>

          {/* Logo */}
          <div className="flex items-center justify-center h-12 max-w-[150px]">
            <img
              src="logo.png"
              alt="Hangout Logo"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Right Controls (Mobile Only) */}
          <div className="flex lg:hidden items-center gap-2">
            {data ? (
              <>
                <button
                  // onClick={onBecomeHostClick}
                  className="flex items-center gap-1.5 rounded-full bg-purple-950 text-white font-semibold py-2.5 px-4 text-xs shadow-md active:scale-97 transition-all cursor-pointer whitespace-nowrap"
                >
                  Become a Host
                </button>
                <div className="h-10 w-10 rounded-full capitalize border border-border overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:scale-105 active:scale-97 transition-all">
                  <h1>{avatar}</h1>
                  {/* <img
                    src={avatar}
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  /> */}
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthModal(true)}
                className="font-semibold hover:text-purple-700 text-gray-800 duration-200 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Tabs Control */}
        {!location.includes("host") && (
          <div className="w-fit flex justify-center items-center gap-5 max-w-100">
            <button
              onClick={() => handleSetActive("all")}
              className={`${isActive === "all" ? "border-black text-[#222]" : "text-gray-600 border-transparent"} cursor-pointer group py-3 flex justify-center items-center gap-2 text-xs xl:text-sm font-semibold transition-all border-b-2`}
            >
              <AllIcon
                size={30}
                className="group-hover:scale-110 ease transition-all duration-200"
              />
              <p className="text-[#222]">All</p>
            </button>

            <button
              onClick={() => handleSetActive("homes")}
              className={`${isActive === "homes" ? "border-black text-[#222]" : "text-gray-600 border-transparent"} cursor-pointer group py-3 flex justify-center items-center gap-2 text-xs xl:text-sm font-semibold transition-all border-b-2`}
            >
              <HomeIcon
                size={30}
                className="group-hover:scale-110 ease transition-all duration-200"
              />
              <p>Homes</p>
            </button>

            <button
              onClick={() => handleSetActive("parties")}
              className={`${isActive === "parties" ? "border-black text-[#222]" : "text-gray-600 border-transparent"} cursor-pointer group py-3 flex justify-center items-center gap-2 text-xs xl:text-sm font-semibold transition-all border-b-2`}
            >
              <PartiesIcon
                size={30}
                className="group-hover:scale-110 ease transition-all duration-200"
              />
              <p>Parties</p>
            </button>
          </div>
        )}

        {/* Right Controls (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Host / Guest account switcher when logged in */}
          {data && (
            <div className="flex items-center rounded-full border border-border bg-muted/40 p-1">
              <button
                onClick={() => navigate("/")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  !location.includes("host")
                    ? "bg-purple-950 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Guest</span>
              </button>
              <button
                onClick={() => navigate("/host")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  location.includes("host")
                    ? "bg-purple-950 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Host</span>
              </button>
            </div>
          )}

          {data ? (
            <>
              {/* Avatar dropdown (Airbnb style) */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-border p-1 pl-3 shadow-sm hover:shadow-md active:scale-97 transition-all cursor-pointer bg-card"
                >
                  <span className="text-xs font-bold text-foreground max-w-[90px] truncate">
                    {displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {currency}
                  </span>
                  <span className="text-sm lg:text-base uppercase font-semibold text-muted-foreground">
                    {avatar}
                  </span>
                  {/* <img
                    src={avatar}
                    alt="Account"
                    className="h-8 w-8 rounded-full object-cover"
                  /> */}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border border-border bg-card shadow-xl p-2 origin-top animate-in fade-in zoom-in-95 duration-150 ease-out z-50">
                    <p className="px-3 py-2 text-xs font-bold text-muted-foreground truncate">
                      Signed in as {data?.firstName || "guest"}
                    </p>
                    <div className="h-px bg-border/60 my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // onSwitchView(viewMode === "host" ? "guest" : "host");
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      <span>
                        {location.includes("host")
                          ? "View as Guest"
                          : "View as Host"}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/favorites");
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Favorites</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // onProfileClick();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // onMenuClick();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Menu className="h-4 w-4" />
                      <span>Menu & settings</span>
                    </button>
                    <div className="h-px bg-border/60 my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        // onLogoutClick();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModal(true)}
              className="font-semibold hover:text-purple-700 text-gray-800 duration-200 cursor-pointer"
            >
              {/* <LogIn className="h-4 w-4" /> */}
              <span className="text-sm">Log In</span>
            </button>
          )}
        </div>
      </div>

      <SearchHeader />
    </header>
  );
};
