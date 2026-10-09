import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Heart, Share2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface IImageViewer {
  images: string[];
  title: string;
  open: boolean;
  startIndex: number;
  onClose: () => void;
  isSaved?: boolean;
  saving?: boolean;
  onToggleSaved?: () => void;
  onShare?: () => void;
}

const arrowClass =
  "absolute top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer sm:flex";

const topButtonClass =
  "rounded-full p-2 transition-colors hover:bg-white/10 disabled:opacity-50 cursor-pointer";

const ImageViewer = ({
  images,
  title,
  open,
  startIndex,
  onClose,
  isSaved = false,
  saving = false,
  onToggleSaved,
  onShare,
}: IImageViewer) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbsRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[current] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    strip.scrollTo({
      left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [current]);

  const setTrack = useCallback(
    (node: HTMLDivElement | null) => {
      trackRef.current = node;
      if (node) {
        node.scrollLeft = startIndex * node.clientWidth;
        setCurrent(startIndex);
      }
    },
    [startIndex],
  );

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goTo(current + 1);
      if (event.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, current, goTo]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black" />
        <DialogPrimitive.Popup className="fixed inset-0 z-50 flex flex-col text-white outline-none">
          <DialogPrimitive.Title className="sr-only">
            {title} photos
          </DialogPrimitive.Title>

          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold">
              {current + 1} / {images.length}
            </span>
            <div className="flex items-center gap-1">
              {onShare && (
                <button
                  type="button"
                  onClick={onShare}
                  className={topButtonClass}
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              )}
              {onToggleSaved && (
                <button
                  type="button"
                  onClick={onToggleSaved}
                  disabled={saving}
                  className={topButtonClass}
                  aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
                  aria-pressed={isSaved}
                >
                  <Heart
                    className={`h-5 w-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
                  />
                </button>
              )}
              <DialogPrimitive.Close
                className={topButtonClass}
                aria-label="Close photos"
              >
                <X className="h-6 w-6" />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              ref={setTrack}
              onScroll={handleScroll}
              className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="flex h-full w-full shrink-0 snap-center items-center justify-center px-2 sm:px-20"
                >
                  <img
                    src={src}
                    alt={`${title} - photo ${index + 1}`}
                    draggable={false}
                    className="max-h-full max-w-full select-none object-contain"
                  />
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(current - 1)}
                  disabled={current === 0}
                  className={`${arrowClass} left-4`}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(current + 1)}
                  disabled={current === images.length - 1}
                  className={`${arrowClass} right-4`}
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent pt-10">
                <div
                  ref={thumbsRef}
                  className="flex gap-2 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden"
                >
              {images.map((src, index) => (
                <button
                  type="button"
                  key={`${src}-thumb-${index}`}
                  onClick={() => goTo(index)}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-[opacity,box-shadow] duration-200 cursor-pointer sm:h-16 sm:w-24 ${
                    index === current
                      ? "opacity-100 ring-2 ring-white"
                      : "opacity-50 hover:opacity-80"
                  }`}
                  aria-label={`Go to photo ${index + 1}`}
                  aria-current={index === current ? "true" : undefined}
                >
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
                </div>
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ImageViewer;
