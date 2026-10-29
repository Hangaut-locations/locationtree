import { ExternalLink, Wallet as WalletIcon } from "lucide-react";
import type React from "react";
import { PEDXO_WALLET_URL } from "../lib/pedxoCheckout";
import type { CurrencyCode } from "../lib/currency";
import type { WalletTransaction } from "../types/listing";

interface WalletViewProps {
  mode: "guest" | "host";
  hostBalance: number;
  guestBalance: number;
  transactions: WalletTransaction[];
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  currency: CurrencyCode;
}

/** Hangaut wallet opens Pedxo Pay (Sexyyo) where guests fund balance and pay bookings. */
export const WalletView: React.FC<WalletViewProps> = ({ mode }) => {
  const isHost = mode === "host";

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-12 text-center md:px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-950/10 text-purple-950">
        <WalletIcon className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-foreground">
        {isHost ? "Host payouts" : "Your Pedxo wallet"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isHost
          ? "Host earnings and withdrawals are managed in Pedxo Pay. Open your wallet to check balances and move money."
          : "Fund your Pedxo wallet, then pay for Hangaut bookings from your available balance at checkout."}
      </p>
      <a
        href={PEDXO_WALLET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-purple-950 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-900"
      >
        Open Pedxo wallet
        <ExternalLink className="h-4 w-4" />
      </a>
      <p className="mt-3 text-xs text-muted-foreground">{PEDXO_WALLET_URL}</p>
    </div>
  );
};

export default WalletView;
