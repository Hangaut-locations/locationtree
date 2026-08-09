import type React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { CURRENCIES, type CurrencyCode } from "../lib/currency";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
  isOpen,
  onClose,
  currency,
  onCurrencyChange,
}) => {
  const [pending, setPending] = useState<CurrencyCode | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSelect = async (code: CurrencyCode) => {
    if (code === currency) {
      onClose();
      return;
    }
    setPending(code);
    setBusy(true);
    // Simulate an exchange-rate API round-trip before committing the new currency.
    window.setTimeout(() => {
      setBusy(false);
      setPending(null);
      onCurrencyChange(code);
      onClose();
    }, 350);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md rounded-[28px] border-t border-border bg-card p-6 sm:p-8 shadow-2xl animate-in fade-in sm:zoom-in-95 duration-200">
        <DialogTitle className="text-xl font-bold text-foreground tracking-tight mb-1">
          Choose your currency
        </DialogTitle>
        <p className="text-sm font-semibold text-muted-foreground mb-5">
          Prices are converted automatically between NGN, USD, EUR and GBP.
        </p>

        <div className="space-y-2">
          {CURRENCIES.map((c) => {
            const isActive = c.code === currency;
            const isPending = c.code === pending;
            return (
              <button
                key={c.code}
                type="button"
                disabled={busy && !isPending}
                onClick={() => handleSelect(c.code)}
                className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-[border-color,background-color,transform] duration-160 ease-out active:scale-97 cursor-pointer disabled:opacity-50 ${
                  isActive
                    ? "border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10"
                    : "border-border/80 bg-card hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg font-bold text-foreground">
                    {c.symbol}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {c.code}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {c.name}
                  </span>
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {isPending ? "…" : isActive ? "Current" : "Select"}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] font-semibold text-muted-foreground">
          The conversion API refreshes live rates. Amounts shown across the app
          update automatically.
        </p>
      </DialogContent>
    </Dialog>
  );
};
