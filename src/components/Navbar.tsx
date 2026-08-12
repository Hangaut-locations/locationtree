import { Briefcase, LogIn, Menu, User } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { DEFAULT_GUEST_AVATAR, DEFAULT_HOST_AVATAR } from "../data/constants";
import type { CurrencyCode } from "../lib/currency";
import { Link } from "react-router-dom";

interface NavbarProps {
  activeTab: "location" | "planning";
  setActiveTab: (tab: "location" | "planning") => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
  userName: string;
  viewMode: "guest" | "host";
  onSwitchView: (mode: "guest" | "host") => void;
  onBecomeHostClick: () => void;
  onMenuClick: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
  currency: CurrencyCode;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLoginClick,
  isLoggedIn,
  userName,
  viewMode,
  onSwitchView,
  onBecomeHostClick,
  onMenuClick,
  onProfileClick,
  onLogoutClick,
  currency,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const avatar =
    isLoggedIn && userName
      ? userName.split(" ")[0][0] + userName.split(" ")[0][1]
      : "G";
  // const avatar =
  //   viewMode === "host" && isLoggedIn
  //     ? DEFAULT_HOST_AVATAR
  //     : DEFAULT_GUEST_AVATAR;
  const displayName =
    isLoggedIn && userName ? userName : viewMode === "host" ? "Host" : "Guest";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex flex-col md:flex-row md:h-20 max-w-7xl items-center justify-between px-4 md:px-8 py-4 md:py-0 gap-4 md:gap-0">
        {/* Top Row for Mobile (Logo + Controls) / Left Column for Desktop */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          {/* Menu button (opens settings side menu) */}
          <button
            onClick={onMenuClick}
            className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2.5 shadow-sm hover:shadow-md active:scale-97 transition-all cursor-pointer bg-card"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 text-foreground" />
            {/* <h2>{avatar}</h2> */}
            {/* {isLoggedIn && (
              <img
                src={avatar}
                alt="Account"
                className="h-6 w-6 rounded-full object-cover hidden sm:block"
              />
            )} */}
            <div className="flex justify-center items-center w-max font-semibold text-sm uppercase">
              {avatar}
            </div>
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
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn ? (
              <>
                <button
                  onClick={onBecomeHostClick}
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
                onClick={onLoginClick}
                className="flex items-center gap-1.5 rounded-full bg-purple-950 text-white font-semibold py-2.5 px-4 text-xs shadow-md active:scale-97 transition-all cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Tabs Control */}
        <div className="flex w-full items-center justify-center md:w-auto">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "location" | "planning")}
            className="w-full md:w-87.5"
          >
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
              <TabsTrigger
                value="location"
                className="cursor-pointer p-2.5 text-center text-sm font-medium tracking-tight transition-all hover:text-purple-950 data-active:bg-purple-900/10 data-active:text-purple-950"
              >
                Location
              </TabsTrigger>

              <TabsTrigger
                value="planning"
                className="cursor-pointer p-2.5 text-center text-sm font-medium tracking-tight transition-all hover:text-purple-950 data-active:bg-purple-900/10 data-active:text-purple-950"
              >
                Planning something?
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Right Controls (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Host / Guest account switcher when logged in */}
          {isLoggedIn && (
            <div className="flex items-center rounded-full border border-border bg-muted/40 p-1">
              <button
                onClick={() => onSwitchView("guest")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "guest"
                    ? "bg-purple-950 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Guest</span>
              </button>
              <button
                onClick={() => onSwitchView("host")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "host"
                    ? "bg-purple-950 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Host</span>
              </button>
            </div>
          )}

          {isLoggedIn ? (
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
                      Signed in as {userName || "guest"}
                    </p>
                    <div className="h-px bg-border/60 my-1" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSwitchView(viewMode === "host" ? "guest" : "host");
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      <span>
                        {viewMode === "host" ? "View as Guest" : "View as Host"}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onProfileClick();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onMenuClick();
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
                        onLogoutClick();
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
              onClick={onLoginClick}
              className="flex items-center gap-2 rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-medium py-2.5 px-6 shadow-md transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span className="text-sm">Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
