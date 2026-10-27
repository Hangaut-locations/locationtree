import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type MouseEvent, type TouchEvent } from "react";

interface CardImageCarouselProps {
  images?: string[];
  title: string;
}

const MAX_DOTS = 5;
const SWIPE_PX = 40;

const CardImageCarousel = ({ images = [], title }: CardImageCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);
  const photos = images.filter(Boolean);
  const hasMany = photos.length > 1;
  const safeIndex = Math.min(current, Math.max(photos.length - 1, 0));

  const goTo = (e: MouseEvent, index: number) => {
    // The card itself is a link; arrows must not open the listing.
    e.stopPropagation();
    e.preventDefault();
    if (!photos.length) return;
    setCurrent((index + photos.length) % photos.length);
  };

  const onTouchStart = (event: TouchEvent) => {
    if (!hasMany) return;
    startX.current = event.touches[0]?.clientX ?? null;
    swiped.current = false;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (startX.current == null || !hasMany) return;
    const x = event.touches[0]?.clientX;
    if (x == null) return;
    if (Math.abs(x - startX.current) > 10) {
      swiped.current = true;
      // Keep the page from treating this as a vertical scroll or a card tap.
      event.stopPropagation();
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (startX.current == null || !hasMany) return;
    const endX = event.changedTouches[0]?.clientX;
    const dx = endX == null ? 0 : endX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    swiped.current = true;
    event.stopPropagation();
    if (dx < 0 && safeIndex < photos.length - 1) {
      setCurrent(safeIndex + 1);
    } else if (dx > 0 && safeIndex > 0) {
      setCurrent(safeIndex - 1);
    }
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!swiped.current) return;
    // A swipe just finished — do not open the listing under the finger.
    event.stopPropagation();
    event.preventDefault();
    swiped.current = false;
  };

  const arrowClass =
    "absolute top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition-opacity duration-150 hover:bg-white hover:scale-105 cursor-pointer md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100";

  // Long galleries show a window of dots around the current photo.
  const dotStart = Math.min(
    Math.max(safeIndex - Math.floor(MAX_DOTS / 2), 0),
    Math.max(photos.length - MAX_DOTS, 0),
  );
  const dots = photos.slice(dotStart, dotStart + MAX_DOTS);

  return (
    <div
      className="relative h-40 w-full overflow-hidden rounded-3xl bg-muted"
      onClickCapture={onClickCapture}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        startX.current = null;
      }}
      style={hasMany ? { touchAction: "pan-y" } : undefined}
    >
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {photos.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`${title} - photo ${i + 1}`}
            className="h-full w-full min-w-full shrink-0 object-cover select-none"
            loading="lazy"
            draggable={false}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-black opacity-10" />

      {hasMany && safeIndex > 0 && (
        <button
          type="button"
          onClick={(e) => goTo(e, safeIndex - 1)}
          className={`${arrowClass} left-2`}
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      {hasMany && safeIndex < photos.length - 1 && (
        <button
          type="button"
          onClick={(e) => goTo(e, safeIndex + 1)}
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
                dotStart + i === safeIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardImageCarousel;
