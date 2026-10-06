interface MobileBookingBarProps {
  price: string;
  unit: string;
  label: string;
  onBook: () => void;
}

/** Price and booking button pinned to the bottom of the screen on phones and tablets. */
const MobileBookingBar = ({ price, unit, label, onBook }: MobileBookingBarProps) => (
  <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-card px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
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

export default MobileBookingBar;
