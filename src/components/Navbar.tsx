import { LogIn } from "lucide-react"
import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"

interface NavbarProps {
  activeTab: "location" | "planning"
  setActiveTab: (tab: "location" | "planning") => void
  onLoginClick: () => void
  isLoggedIn: boolean
  onBecomeHostClick: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLoginClick,
  isLoggedIn,
  onBecomeHostClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex flex-col md:flex-row md:h-20 max-w-7xl items-center justify-between px-4 md:px-8 py-4 md:py-0 gap-4 md:gap-0">
        {/* Top Row for Mobile (Logo + Controls) / Left Column for Desktop */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          {/* Logo */}
          <div className="flex items-center justify-center h-12 max-w-[150px]">
            <img src="logo.png" alt="Hangout Logo" className="h-full w-full object-contain" />
          </div>

          {/* Right Controls (Mobile Only) */}
          <div className="flex md:hidden items-center gap-2">
            {/* Login Button */}
            {isLoggedIn ? (
              <>
                <button
                  onClick={onBecomeHostClick}
                  className="flex items-center gap-1.5 rounded-full bg-purple-950 text-white font-semibold py-2.5 px-4 text-xs shadow-md active:scale-97 transition-all cursor-pointer whitespace-nowrap"
                >
                  Become a Host
                </button>
                <div className="h-10 w-10 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:scale-105 active:scale-97 transition-all">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                    alt="User avatar"
                    className="h-full w-full object-cover"
                  />
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
            className="w-full md:w-[320px]"
          >
            <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
              <TabsTrigger
                value="location"
                className="cursor-pointer py-2.5 text-center text-sm font-semibold tracking-tight transition-all hover:bg-muted/40 data-active:bg-transparent data-active:text-foreground"
              >
                Location
              </TabsTrigger>

              <TabsTrigger
                value="planning"
                className="cursor-pointer py-2.5 text-center text-sm font-semibold tracking-tight transition-all hover:bg-muted/40 data-active:bg-transparent data-active:text-foreground"
              >
                Planning something?
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Right Controls (Desktop Only) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Login Button */}
          {isLoggedIn ? (
            <>
              <button
                onClick={onBecomeHostClick}
                className="flex items-center gap-2 rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-semibold py-2.5 px-5 shadow-md transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer"
              >
                Become a Host
              </button>
              <div className="h-10 w-10 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-semibold py-2.5 px-6 shadow-md transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
