import { useState } from "react";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const toText = (value: number) => (value > 0 ? String(value) : "");

const cleanPrice = (raw: string) =>
  raw
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1")
    .replace(/^0+(?=\d)/, "");

/** Big price box on the host wizards. Plain text so it can be fully cleared and only takes digits and one dot. */
const PriceInput = ({ value, onChange, className = "" }: PriceInputProps) => {
  const [text, setText] = useState(() => toText(value));
  const [lastValue, setLastValue] = useState(value);

  // value can change from outside (editing a listing loads, currency rates come in), keep the box in sync
  if (value !== lastValue) {
    setLastValue(value);
    if ((Number(text) || 0) !== value) setText(toText(value));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="0"
      aria-label="Price"
      value={text}
      onChange={(e) => {
        const next = cleanPrice(e.target.value);
        setText(next);
        onChange(Number(next) || 0);
      }}
      style={{ width: `${Math.max(text.length, 2) + 1}ch` }}
      className={`max-w-full border-r border-border/60 bg-transparent text-center text-foreground outline-none placeholder:text-muted-foreground/50 ${className}`}
    />
  );
};

export default PriceInput;
