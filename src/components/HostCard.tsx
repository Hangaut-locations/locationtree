import { CalendarDays, MapPin, Phone } from "lucide-react";
import type { ListingHost } from "../types/listing";

const HostCard = ({ host }: { host?: ListingHost | null }) => {
  if (!host) return null;

  const name = `${host.firstName ?? ""} ${host.lastName ?? ""}`.trim() || "Host";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const location = [host.city, host.state, host.country]
    .filter(Boolean)
    .join(", ");
  const joined = host.createdAt
    ? new Date(host.createdAt).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <section className="border-b border-border py-7" aria-label="Host">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg font-semibold text-purple-700">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-semibold">Hosted by {name}</h2>
          {joined && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> Joined {joined}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        {location && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" /> {location}
          </p>
        )}
        {host.phone && (
          <a
            href={`tel:${host.phone}`}
            className="flex items-center gap-2 font-medium hover:underline"
          >
            <Phone className="h-4 w-4 shrink-0" /> {host.phone}
          </a>
        )}
      </div>

      {host.bio && (
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {host.bio}
        </p>
      )}
    </section>
  );
};

export default HostCard;
