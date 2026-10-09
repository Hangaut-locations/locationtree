import { useEffect, useRef } from "react";

interface MobileBookingBarProps {
  price: string;
  unit: string;
  label: string;
  onBook: () => void;
}

/** Price and booking button pinned to the bottom of the screen on phones and tablets. */
const MobileBookingBar = ({ price, unit, label, onBook }: MobileBookingBarProps) => {
  const barRef = useRef<HTMLDivElement>(null);

  // the bar is fixed, so push the bottom of the page (footer) up by its height or the end of the footer sits under it
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const fit = () => {
      document.body.style.paddingBottom = bar.offsetHeight ? `${bar.offsetHeight}px` : "";
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(bar);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
      document.body.style.paddingBottom = "";
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-card px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
    >
      <p className="text-sm">
        <span className="text-lg font-semibold">{price}</span>{" "}
        <span className="text-muted-foreground">per {unit}</span>
      </p>
      <button
        type="button"
        onClick={onBook}
        className="rounded-xl bg-purple-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-600"
      >
        {label}
      </button>
    </div>
  );
};

export default MobileBookingBar;
