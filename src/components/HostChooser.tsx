import { CalendarDays, ChevronLeft, Home, PartyPopper } from "lucide-react";
import type React from "react";

interface HostChooserProps {
  onBack: () => void;
  onParty: () => void;
  onProperty: () => void;
}

export const HostChooser: React.FC<HostChooserProps> = ({
  onBack,
  onParty,
  onProperty,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md px-4 py-4 md:px-8 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Exit</span>
        </button>
        <div className="flex items-center h-12 max-w-37.5">
          <img
            src="logo.png"
            alt="Hangout Logo"
            className="h-full w-full object-contain"
          />
        </div>
      </header>

      <main className="grow flex items-center justify-center px-4 md:px-8 py-12">
        <div className="w-full max-w-4xl mx-auto space-y-10 animate-in fade-in fade-in-20 duration-300">
          <div className="text-center space-y-3">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-950 dark:text-purple-300">
              Become a Host
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              What would you like to do today?
            </h1>
            <p className="text-base font-semibold text-muted-foreground max-w-xl mx-auto">
              Choose how you want to earn with Hangout. Hosting a party and
              listing a property each collect different information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Host a party */}
            <button
              onClick={onParty}
              className="group flex flex-col items-start text-left p-8 rounded-3xl border border-border bg-card hover:border-purple-950/40 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
            >
              <div className="h-14 w-14 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <PartyPopper className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Host a party
              </h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground leading-relaxed">
                Whether it's a beach party, yacht gathering, live show or
                birthday — share your event, sell tickets, and get guests to
                book in. Set your dates, pictures, rules and price per person or
                hour.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-purple-950 dark:text-purple-300">
                <CalendarDays className="h-4 w-4" />
                <span>Get started</span>
              </div>
            </button>

            {/* Option 2: List a property */}
            <button
              onClick={onProperty}
              className="group flex flex-col items-start text-left p-8 rounded-3xl border border-border bg-card hover:border-purple-950/40 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
            >
              <div className="h-14 w-14 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Home className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                List a property
              </h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground leading-relaxed">
                List your space to be used as a location or spot for events and
                parties. With Hangout you get extended reach that leads to
                diverse guests and more opportunities for your business.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-purple-950 dark:text-purple-300">
                <Home className="h-4 w-4" />
                <span>Get started</span>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
