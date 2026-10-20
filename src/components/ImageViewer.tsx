import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
  Share2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { videoSlide } from "../lib/media";
import type { ListingVideo } from "../types/listing";

type Slide =
  | { kind: "photo"; src: string }
  | { kind: "video"; src: string; poster: string };

interface IImageViewer {
  images: string[];
  video?: ListingVideo | null;
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

const bottomButtonClass =
  "flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20 disabled:opacity-50 cursor-pointer";

const ImageViewer = ({
  images,
  video,
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const tapTimer = useRef<number | null>(null);
  const [current, setCurrent] = useState(startIndex);
  const [chromeOn, setChromeOn] = useState(true);
  const [zoomed, setZoomed] = useState(false);

  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = images.map((src) => ({ kind: "photo", src }));
    if (video) {
      list.splice(videoSlide(images.length), 0, {
        kind: "video",
        src: video.url,
        poster: video.poster,
      });
    }
    return list;
  }, [images, video]);

  // Plays muted while it's on screen, so swiping past it is quiet.
  useEffect(() => {
    const player = videoRef.current;
    if (!player) return;
    if (open && slides[current]?.kind === "video") {
      player.play().catch(() => {});
    } else {
      player.pause();
    }
  }, [open, current, slides]);

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

  useEffect(() => {
    setZoomed(false);
  }, [current, open]);

  useEffect(
    () => () => {
      if (tapTimer.current) window.clearTimeout(tapTimer.current);
    },
    [],
  );

  // One tap hides the cards and the buttons. A second tap brings them back.
  // Two quick taps zoom in, and two more zoom back out.
  const onPhotoTap = () => {
    if (tapTimer.current) {
      window.clearTimeout(tapTimer.current);
      tapTimer.current = null;
      setZoomed((on) => !on);
      return;
    }
    tapTimer.current = window.setTimeout(() => {
      tapTimer.current = null;
      setChromeOn((on) => !on);
    }, 260);
  };

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

          <div className="flex items-center gap-3 px-4 py-3">
            <span className="shrink-0 text-sm font-semibold">
              {current + 1} / {slides.length}
            </span>
            <div className="min-w-0 flex-1">
              {chromeOn && slides.length > 1 && (
                <div
                  ref={thumbsRef}
                  className="relative flex gap-2 overflow-x-auto p-0.5 [scrollbar-width:none] sm:justify-center-safe [&::-webkit-scrollbar]:hidden"
                >
                  {slides.map((slide, index) => (
                    <button
                      type="button"
                      key={`${slide.src}-thumb-${index}`}
                      onClick={() => goTo(index)}
                      className={`relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-800 transition-[opacity,box-shadow] duration-200 cursor-pointer sm:h-14 sm:w-20 ${
                        index === current
                          ? "opacity-100 ring-2 ring-white"
                          : "opacity-50 hover:opacity-80"
                      }`}
                      aria-label={
                        slide.kind === "video"
                          ? "Go to video"
                          : `Go to photo ${index + 1}`
                      }
                      aria-current={index === current ? "true" : undefined}
                    >
                      {(slide.kind === "photo" || slide.poster) && (
                        <img
                          src={slide.kind === "video" ? slide.poster : slide.src}
                          alt=""
                          draggable={false}
                          onError={(event) => {
                            if (slide.kind === "video") {
                              event.currentTarget.style.display = "none";
                            }
                          }}
                          className="h-full w-full object-cover"
                        />
                      )}
                      {slide.kind === "video" && (
                        <Play className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 fill-white text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <DialogPrimitive.Close
              className={`${topButtonClass} shrink-0`}
              aria-label="Close photos"
            >
              <X className="h-6 w-6" />
            </DialogPrimitive.Close>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              ref={setTrack}
              onScroll={handleScroll}
              className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {slides.map((slide, index) => (
                <div
                  key={`${slide.src}-${index}`}
                  onClick={slide.kind === "photo" ? onPhotoTap : undefined}
                  className="flex h-full w-full shrink-0 snap-center items-center justify-center overflow-hidden px-2 sm:px-20"
                >
                  {slide.kind === "video" ? (
                    <video
                      ref={videoRef}
                      src={slide.src}
                      poster={slide.poster || undefined}
                      controls
                      muted
                      playsInline
                      loop
                      preload="none"
                      aria-label={`${title} - video`}
                      className="max-h-full max-w-full"
                    />
                  ) : (
                    <img
                      src={slide.src}
                      alt={`${title} - photo ${index + 1}`}
                      draggable={false}
                      className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
                      style={
                        zoomed && index === current
                          ? { transform: "scale(1.8)" }
                          : undefined
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            {slides.length > 1 && (
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
                  disabled={current === slides.length - 1}
                  className={`${arrowClass} right-4`}
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

          </div>

          <div className="flex flex-col items-center gap-4 px-4 pb-5 pt-3">
            {chromeOn && (onShare || onToggleSaved) && (
              <div className="flex items-center gap-3">
                {onShare && (
                  <button
                    type="button"
                    onClick={onShare}
                    className={bottomButtonClass}
                    aria-label="Share"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                )}
                {onToggleSaved && (
                  <button
                    type="button"
                    onClick={onToggleSaved}
                    disabled={saving}
                    className={bottomButtonClass}
                    aria-label={
                      isSaved ? "Remove from favorites" : "Save to favorites"
                    }
                    aria-pressed={isSaved}
                  >
                    <Heart
                      className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {isSaved ? "Saved" : "Save"}
                  </button>
                )}
              </div>
            )}

            {slides.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    type="button"
                    key={`${slide.src}-dot-${index}`}
                    onClick={() => goTo(index)}
                    className={`h-2 rounded-full transition-[width,background-color] duration-200 cursor-pointer ${
                      index === current ? "w-6 bg-white" : "w-2 bg-white/40"
                    }`}
                    aria-label={
                      slide.kind === "video" ? "Video" : `Photo ${index + 1}`
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default ImageViewer;
