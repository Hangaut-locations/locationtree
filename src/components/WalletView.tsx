import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Briefcase,
  CreditCard,
  User,
  Wallet as WalletIcon,
} from "lucide-react"
import type React from "react"
import { useState } from "react"
import { type CurrencyCode, displayPrice, formatPrice } from "../lib/currency"
import type { WalletTransaction } from "../types/listing"

interface WalletViewProps {
  mode: "guest" | "host"
  hostBalance: number
  guestBalance: number
  transactions: WalletTransaction[]
  onDeposit: (amount: number) => void
  onWithdraw: (amount: number) => void
  currency: CurrencyCode
}

const VIRTUAL_ACCOUNT = "0123 4567 8901" // placeholder virtual account for guest deposits

export const WalletView: React.FC<WalletViewProps> = ({
  mode,
  hostBalance,
  guestBalance,
  transactions,
  onDeposit,
  onWithdraw,
  currency,
}) => {
  const [amount, setAmount] = useState(0)
  const [selectedAccount, setSelectedAccount] = useState("GTBank •• 8842")

  const balance = mode === "host" ? hostBalance : guestBalance
  const isHost = mode === "host"

  const actions = [
    { label: isHost ? "Withdraw to bank" : "Deposit money", handler: () => onDeposit(Math.max(1, amount)) },
    { label: isHost ? "Add funds" : "Withdraw", handler: () => onWithdraw(Math.max(1, amount)) },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center">
          <WalletIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {isHost ? "Host Wallet" : "Wallet & Payments"}
          </h1>
          <p className="text-sm font-semibold text-muted-foreground">
            {isHost
              ? "Your earnings from parties and property listings. Withdraw anytime to your bank."
              : "Deposit money to pay for bookings and reservations."}
          </p>
        </div>
      </div>

      {/* Balance card */}
      <div className="rounded-[28px] border border-border bg-card p-6 md:p-8 shadow-sm bg-linear-to-br from-purple-950 to-purple-800 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Available balance</p>
        <p className="mt-2 text-4xl font-black tracking-tight">
          {formatPrice(displayPrice(balance, currency), currency)}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-white/80">
          {isHost ? (
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" /> Host earnings
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> Guest payments
            </span>
          )}
          <span className="text-white/50">·</span>
          <span>{currency}</span>
        </div>
      </div>

      {/* Amount + actions */}
      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-black text-foreground">{currency === "NGN" ? "₦" : "$"}</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-40 border-b border-border text-center text-4xl font-black text-foreground outline-none bg-transparent"
            placeholder="0"
          />
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {actions.map((a, i) => (
            <button
              key={a.label}
              onClick={a.handler}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black transition-[transform,background-color] duration-160 ease-out active:scale-97 cursor-pointer ${
                i === 0
                  ? "bg-purple-950 text-white hover:bg-purple-900"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              {i === 0 ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
              <span>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Guest virtual account notice */}
        {!isHost && (
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 flex items-center gap-3">
            <Banknote className="h-5 w-5 text-purple-950 dark:text-purple-300 shrink-0" />
            <p className="text-xs font-semibold text-muted-foreground">
              Fund your wallet via your virtual account number{" "}
              <span className="font-black text-foreground">{VIRTUAL_ACCOUNT}</span>. Deposits reflect automatically.
            </p>
          </div>
        )}
      </div>

      {/* Withdraw bank account */}
      {isHost && (
        <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
          <p className="text-sm font-black text-foreground">Withdraw to your bank account</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground outline-none cursor-pointer"
            >
              <option>GTBank •• 8842</option>
              <option>Zenith •• 2231</option>
              <option>Kuda •• 9107</option>
            </select>
            <button
              onClick={() => onWithdraw(Math.max(1, amount))}
              className="rounded-full border border-border px-6 py-3 text-sm font-black text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Withdraw
            </button>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="rounded-3xl border border-border bg-card p-6 pb-2">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-purple-950 dark:text-purple-300" />
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Transactions</h3>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm font-semibold text-muted-foreground pb-4">
            No transactions yet.{" "}
            {isHost ? "Earnings appear here as guests book." : "Deposits and payments appear here."}
          </p>
        ) : (
          <div className="divide-y divide-border/50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-black text-foreground">{tx.label}</p>
                  <p className="text-[11px] font-semibold text-muted-foreground">{tx.date}</p>
                </div>
                <span className={`text-sm font-black ${tx.type === "credit" ? "text-green-600" : "text-foreground"}`}>
                  {tx.type === "credit" ? "+" : "−"}
                  {formatPrice(displayPrice(tx.amount, currency), currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
