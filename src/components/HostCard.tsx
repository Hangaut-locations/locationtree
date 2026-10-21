import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import type { ListingHost } from "../types/listing";
import MessageButton from "./chat/MessageButton";
import { StoryFace } from "./stories/Stories";

const HostCard = ({
  host,
  listing,
}: {
  host?: ListingHost | null;
  listing?: { type: "party" | "property"; id: string };
}) => {
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
        <StoryFace
          userId={host._id}
          initials={initials}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg font-semibold text-purple-700"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">Hosted by {name}</h2>
          {joined && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> Joined {joined}
            </p>
          )}
        </div>
        {listing && (
          <MessageButton
            userId={host._id}
            listingType={listing.type}
            listingId={listing.id}
            label="Message"
            className="shrink-0 rounded-full bg-purple-950 px-4 py-2 text-xs font-bold text-white hover:bg-purple-900 disabled:opacity-60"
          />
        )}
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
        {host.email && (
          <a
            href={`mailto:${host.email}`}
            className="flex min-w-0 items-center gap-2 font-medium hover:underline"
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{host.email}</span>
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
