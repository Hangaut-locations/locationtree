import type React from "react";
import { useRef } from "react";

export const CODE_LENGTH = 6;

interface CodeInputProps {
  value: string[];
  onChange: (code: string[]) => void;
}

/** 6 boxes for the emailed code, pasting the whole code fills them all. */
export const CodeInput: React.FC<CodeInputProps> = ({ value, onChange }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const fill = (start: number, digits: string) => {
    const next = [...value];
    digits
      .slice(0, CODE_LENGTH - start)
      .split("")
      .forEach((digit, offset) => {
        next[start + offset] = digit;
      });
    onChange(next);
    refs.current[Math.min(start + digits.length, CODE_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={CODE_LENGTH}
          value={digit}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            if (!digits) {
              const next = [...value];
              next[index] = "";
              onChange(next);
              return;
            }
            // typing over a box keeps the newest digit, pasting / autofill drops the whole code in
            fill(index, digits.length > 1 && digit ? digits.slice(-1) : digits);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            const digits = e.clipboardData.getData("text").replace(/\D/g, "");
            if (!digits) return;
            e.preventDefault();
            fill(0, digits);
          }}
          className="h-12 w-11 sm:h-14 sm:w-12 rounded-2xl border border-border/80 bg-card text-center text-xl font-bold text-foreground focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export const emptyCode = () => Array.from({ length: CODE_LENGTH }, () => "");
