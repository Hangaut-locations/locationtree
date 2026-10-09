import { useState } from "react";

interface CountInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

/** Whole number box (guests, hours, days). Can be cleared while typing, goes back to min if left empty. */
const CountInput = ({
  value,
  min,
  max,
  onChange,
  className,
}: CountInputProps) => {
  const [text, setText] = useState(String(value));
  const [lastValue, setLastValue] = useState(value);

  // value can change from outside (saved booking restored after logging in)
  if (value !== lastValue) {
    setLastValue(value);
    if (text !== "" && Number(text) !== value) setText(String(value));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={text}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
        if (!digits) {
          setText("");
          return;
        }
        const next = Math.min(Number(digits), max);
        setText(String(next));
        if (next >= min) onChange(next);
      }}
      onBlur={() => {
        const next = Math.max(Number(text) || min, min);
        setText(String(next));
        onChange(next);
      }}
      className={className}
    />
  );
};

export default CountInput;
