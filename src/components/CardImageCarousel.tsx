import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";

interface CardImageCarouselProps {
  images?: string[];
  title: string;
}

const MAX_DOTS = 5;

const CardImageCarousel = ({ images = [], title }: CardImageCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const photos = images.filter(Boolean);
  const hasMany = photos.length > 1;

  const goTo = (e: MouseEvent, index: number) => {
    // The card itself is a link; arrows must not open the listing.
    e.stopPropagation();
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  };

  const arrowClass =
    "absolute top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition-opacity duration-150 hover:bg-white hover:scale-105 cursor-pointer md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100";

  // Long galleries show a window of dots around the current photo.
  const dotStart = Math.min(
    Math.max(current - Math.floor(MAX_DOTS / 2), 0),
    Math.max(photos.length - MAX_DOTS, 0),
  );
  const dots = photos.slice(dotStart, dotStart + MAX_DOTS);

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-3xl bg-muted">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`${title} - photo ${i + 1}`}
            className="h-full w-full shrink-0 snap-center object-cover select-none"
            loading="lazy"
            draggable={false}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-black opacity-10" />

      {hasMany && current > 0 && (
        <button
          type="button"
          onClick={(e) => goTo(e, current - 1)}
          className={`${arrowClass} left-2`}
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {hasMany && current < photos.length - 1 && (
        <button
          type="button"
          onClick={(e) => goTo(e, current + 1)}
          className={`${arrowClass} right-2`}
          aria-label="Next photo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {hasMany && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1">
          {dots.map((_, i) => (
            <span
              key={dotStart + i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                dotStart + i === current ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardImageCarousel;
