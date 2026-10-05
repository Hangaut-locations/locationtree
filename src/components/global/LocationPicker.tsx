import { Crosshair, LoaderCircle, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";

// maplibre looks for its worker next to the bundle by default, where Vite doesn't put it.
setWorkerUrl(maplibreWorkerUrl);

interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  quickPicks?: string[];
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface NominatimAddress {
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  village?: string;
  hamlet?: string;
  city?: string;
  town?: string;
  city_district?: string;
  county?: string;
  state?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: NominatimAddress;
}

interface Suggestion {
  id: number;
  title: string;
  subtitle: string;
  label: string;
  coordinates: Coordinates;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
// Free vector map style; no API key or usage limits. Its credits are added automatically.
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const DEFAULT_CENTER: Coordinates = { lat: 6.5244, lng: 3.3792 };
const SEARCH_DEBOUNCE_MS = 450;

const PIN_ICON = L.divIcon({
  className: "",
  iconSize: [40, 48],
  iconAnchor: [20, 46],
  html: `
    <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 8px rgba(59,7,100,0.35))">
      <path d="M20 46s16-14.4 16-27A16 16 0 0 0 4 19c0 12.6 16 27 16 27z" fill="#3b0764"/>
      <circle cx="20" cy="19" r="6.5" fill="#ffffff"/>
    </svg>`,
});

/** "Area, City, State": short enough to read and to group listings by. */
const shortAddress = (result: NominatimResult) => {
  const address = result.address ?? {};
  const parts = [
    address.neighbourhood ??
      address.suburb ??
      address.quarter ??
      address.village ??
      address.hamlet,
    address.city ?? address.town ?? address.city_district ?? address.county,
    address.state,
  ].filter((part): part is string => Boolean(part));
  const unique = parts.filter((part, index) => parts.indexOf(part) === index);
  return unique.length ? unique.join(", ") : result.display_name;
};

const toSuggestion = (result: NominatimResult): Suggestion => {
  const subtitle = shortAddress(result);
  const title = result.name || result.display_name.split(",")[0];
  return {
    id: result.place_id,
    title,
    subtitle,
    label: subtitle.startsWith(title) ? subtitle : `${title}, ${subtitle}`,
    coordinates: { lat: Number(result.lat), lng: Number(result.lon) },
  };
};

const nominatim = async <T,>(
  path: "search" | "reverse",
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> => {
  const query = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    ...params,
  });
  const response = await fetch(`${NOMINATIM_URL}/${path}?${query}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`Nominatim ${path} failed`);
  return response.json();
};

const searchPlaces = (text: string, limit: number, signal?: AbortSignal) =>
  nominatim<NominatimResult[]>(
    "search",
    { q: text, countrycodes: "ng", limit: String(limit) },
    signal,
  ).then((results) => results.map(toSuggestion));

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search for an area, street or landmark",
  quickPicks = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const skipNextSearchRef = useRef(true);

  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const moveTo = (coordinates: Coordinates, zoom = 15) => {
    markerRef.current?.setLatLng(coordinates);
    mapRef.current?.flyTo(coordinates, zoom, { duration: 0.8 });
  };

  const choose = (label: string) => {
    skipNextSearchRef.current = true;
    setQuery(label);
    onChange(label);
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const reverseGeocode = async ({ lat, lng }: Coordinates) => {
    setResolving(true);
    setError("");
    try {
      const result = await nominatim<NominatimResult>("reverse", {
        lat: String(lat),
        lon: String(lng),
        zoom: "17",
      });
      choose(shortAddress(result));
    } catch {
      setError("Couldn't find an address for that spot. Try another point.");
    } finally {
      setResolving(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      maxZoom: 19,
    }).setView(DEFAULT_CENTER, 12);

    maplibreGL({ style: MAP_STYLE_URL }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const marker = L.marker(DEFAULT_CENTER, {
      icon: PIN_ICON,
      draggable: true,
      autoPan: true,
    }).addTo(map);

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      map.panTo(position);
      reverseGeocode(position);
    });
    map.on("click", (event: L.LeafletMouseEvent) => {
      moveTo(event.latlng, Math.max(map.getZoom(), 15));
      reverseGeocode(event.latlng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // When editing, put the pin on the saved location without changing its text.
    if (value.trim()) {
      searchPlaces(value, 1)
        .then(([match]) => match && moveTo(match.coordinates, 14))
        .catch(() => undefined);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const text = query.trim();
    searchAbortRef.current?.abort();
    if (text.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearching(true);

    // Nominatim allows about one request per second, so wait for typing to pause.
    const timer = window.setTimeout(() => {
      searchPlaces(text, 5, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setActiveIndex(results.length ? 0 : -1);
          setIsOpen(true);
        })
        .catch((err: Error) => {
          if (err.name !== "AbortError") setSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const pickSuggestion = (suggestion: Suggestion) => {
    moveTo(suggestion.coordinates);
    choose(suggestion.label);
  };

  const pickQuickLocation = async (name: string) => {
    setResolving(true);
    setError("");
    try {
      const [match] = await searchPlaces(name, 1);
      if (!match) throw new Error("No match");
      moveTo(match.coordinates, 13);
      choose(match.label);
    } catch {
      setError(`Couldn't find ${name}. Try searching instead.`);
    } finally {
      setResolving(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location access.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = { lat: coords.latitude, lng: coords.longitude };
        moveTo(coordinates, 16);
        reverseGeocode(coordinates).finally(() => setLocating(false));
      },
      () => {
        setLocating(false);
        setError("Location access was blocked. Search or tap the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (!isOpen || !suggestions.length) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (index) => (index - 1 + suggestions.length) % suggestions.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const suggestion = suggestions[Math.max(activeIndex, 0)];
      if (suggestion) pickSuggestion(suggestion);
    }
  };

  const busy = searching || resolving || locating;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <div className="relative z-[1100]">
        <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 shadow-sm transition-colors focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-600/10">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="location-suggestions"
            aria-autocomplete="list"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => suggestions.length && setIsOpen(true)}
            onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
            onKeyDown={handleKeyDown}
            className="w-full border-none bg-transparent p-0 text-sm font-semibold text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground focus:ring-0"
          />
          {busy ? (
            <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-purple-600" />
          ) : (
            query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>

        {isOpen && query.trim().length >= 3 && !searching && (
          <ul
            id="location-suggestions"
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-border/80 bg-card p-1.5 shadow-2xl"
          >
            {suggestions.length ? (
              suggestions.map((suggestion, index) => (
                <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => pickSuggestion(suggestion)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      index === activeIndex ? "bg-purple-950/5 dark:bg-purple-800/20" : ""
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <MapPin className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {suggestion.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {suggestion.subtitle}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                No places found. Try a nearby area or landmark.
              </li>
            )}
          </ul>
        )}
      </div>

      {quickPicks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {quickPicks.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => pickQuickLocation(name)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                value.toLowerCase().includes(name.toLowerCase())
                  ? "border-purple-950 bg-purple-950 text-white"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="relative z-[1] aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-muted shadow-sm sm:aspect-video">
        <div ref={mapContainerRef} className="absolute inset-0" />

        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-gray-900 shadow-md transition hover:bg-gray-50 disabled:opacity-60"
        >
          {locating ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
          Use my location
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
          <MapPin className="h-4 w-4 text-purple-700 dark:text-purple-300" />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {resolving ? "Finding address..." : "Selected location"}
          </span>
          <span className="block truncate text-sm font-semibold text-foreground">
            {value || "Search, tap the map or drag the pin"}
          </span>
        </span>
      </div>

      <p className={`text-center text-xs ${error ? "text-red-600" : "text-muted-foreground"}`}>
        {error || "Drag the pin or tap anywhere on the map to fine-tune the spot."}
      </p>
    </div>
  );
};

export default LocationPicker;
