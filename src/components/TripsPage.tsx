import { Plane, Ticket } from "lucide-react"
import type React from "react"
import { type CurrencyCode, displayPrice, formatPrice } from "../lib/currency"
import type { Booking } from "../types/listing"

interface TripsPageProps {
  bookings: Booking[]
  currency: CurrencyCode
}

export const TripsPage: React.FC<TripsPageProps> = ({ bookings, currency }) => {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center">
          <Plane className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Booked Trips</h1>
          <p className="text-sm font-semibold text-muted-foreground">Your parties and reservations</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-14 text-center">
          <Ticket className="h-9 w-9 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-black text-foreground">No trips yet</p>
          <p className="text-sm font-semibold text-muted-foreground mt-1">Book a party or property to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
              <img src={b.image} alt={b.title} className="h-20 w-20 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground truncate">{b.title}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {b.location} · {b.date} · {b.guests} guests
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-foreground">
                  {formatPrice(displayPrice(b.total, currency), currency)}
                </p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Booked</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
