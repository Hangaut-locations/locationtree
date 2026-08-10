import { MapPin } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface IStepOneProps {
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const DEFAULT_LOCATION: Coordinates = {
  lat: 6.5244,
  lng: 3.3792,
};

const PartyStepThree: React.FC<IStepOneProps> = ({ location, setLocation }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_LOCATION);

  const [searching, setSearching] = useState(false);

  /**
   * Initialize map
   */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapContainerRef.current).setView(
      [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
      11,
    );

    /**
     * OpenStreetMap tiles
     */
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    /**
     * Initial marker
     */
    const marker = L.marker([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]).addTo(
      map,
    );

    markerRef.current = marker;
    mapRef.current = map;

    /**
     * Click anywhere on map
     */
    map.on("click", async (event) => {
      const { lat, lng } = event.latlng;

      updateMarker(lat, lng);

      await reverseGeocode(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  /**
   * Update marker and map position
   */
  const updateMarker = (lat: number, lng: number) => {
    setCoordinates({
      lat,
      lng,
    });

    markerRef.current?.setLatLng([lat, lng]);

    mapRef.current?.flyTo([lat, lng], 14, {
      duration: 1,
    });
  };

  /**
   * Search location using Nominatim
   */
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    try {
      setSearching(true);

      const params = new URLSearchParams({
        q: `${query}, Nigeria`,
        format: "json",
        addressdetails: "1",
        limit: "1",
        countrycodes: "ng",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const results = await response.json();

      if (!results.length) {
        return;
      }

      const result = results[0];

      const lat = Number(result.lat);
      const lng = Number(result.lon);

      updateMarker(lat, lng);

      setLocation(result.display_name);
    } catch (error) {
      console.error("Location search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Reverse geocode coordinates
   */
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setSearching(true);

      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: "json",
        addressdetails: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }

      const result = await response.json();

      if (result.display_name) {
        setLocation(result.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Search when pressing Enter
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      searchLocation(location);
    }
  };

  /**
   * Predefined locations
   */
  const selectLocation = (loc: string) => {
    setLocation(loc);

    searchLocation(loc);
  };
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out relative">
      <div className="space-y-1.5 text-center">
        <span className="text-sm font-semibold text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
          Step 3
        </span>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
          Where is the party located?
        </h2>
        <p className="text-xs text-muted-foreground">
          The address is only shared with guests after they book a ticket.
        </p>
      </div>
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 border border-border/80 bg-card rounded-full px-5 py-3 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10 w-full">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Party location (e.g. Lekki, Paris, London)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm font-semibold text-foreground outline-none border-none p-0 focus:ring-0"
          />
          {searching && (
            <div className="h-4 w-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {["Lekki", "Surulere", "Lagos"].map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => selectLocation(loc)}
              className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all cursor-pointer
                  ${
                    location.toLowerCase().includes(loc.toLowerCase())
                      ? "bg-purple-950 text-white border-purple-950"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Real Map */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm aspect-video max-w-lg mx-auto relative">
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Selected Location */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 dark:bg-black/85 backdrop-blur rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-purple-600" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">
              Selected location
            </p>

            <p className="text-sm font-bold truncate">
              {location || "Select a location"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyStepThree;
