import React, { useEffect, useMemo, useState } from "react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

interface CountryOption {
  code: CountryCode;
  dialCode: string;
  flag: string;
}

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultCountry?: CountryCode;
  error?: string;
  disabled?: boolean;
  onBlur?: (
    value: any,
  ) => React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
}

const getFlagEmoji = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};

const countries: CountryOption[] = getCountries().map((country) => ({
  code: country,
  dialCode: `+${getCountryCallingCode(country)}`,
  flag: getFlagEmoji(country),
}));

const PhoneInput: React.FC<PhoneInputProps> = ({
  value = "",
  onChange,
  placeholder = "801 234 5678",
  defaultCountry = "NG",
  error,
  onBlur,
  disabled = false,
}) => {
  const [country, setCountry] = useState<CountryCode>(defaultCountry);

  const [phone, setPhone] = useState("");

  const [isValid, setIsValid] = useState<boolean | null>(null);

  /**
   * Convert external international value into
   * the local phone input.
   */
  useEffect(() => {
    if (!value) {
      setPhone("");
      return;
    }

    const parsed = parsePhoneNumberFromString(value);

    if (parsed) {
      setCountry(parsed.country ?? defaultCountry);
      setPhone(parsed.nationalNumber);
    } else {
      setPhone(value);
    }
  }, [value, defaultCountry]);

  const selectedCountry = useMemo(
    () => countries.find((item) => item.code === country),
    [country],
  );

  const validatePhone = (phoneValue: string, selectedCountry: CountryCode) => {
    if (!phoneValue.trim()) {
      setIsValid(null);
      onChange("");
      return;
    }

    const parsed = parsePhoneNumberFromString(phoneValue, selectedCountry);

    if (!parsed) {
      setIsValid(false);
      onChange(phoneValue);
      return;
    }

    const valid = parsed.isValid();

    setIsValid(valid);

    /**
     * Return the complete international number
     *
     * Example:
     * +2348012345678
     */
    onChange(parsed.number);
  };

  const handlePhoneChange = (value: string) => {
    /**
     * Allow only numbers, spaces,
     * parentheses and hyphens.
     */
    const cleaned = value.replace(/[^\d\s()-]/g, "");

    setPhone(cleaned);

    validatePhone(cleaned, country);
  };

  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry);

    /**
     * Revalidate existing number
     * against the new country.
     */
    if (phone) {
      validatePhone(phone, newCountry);
    }
  };

  return (
    <div className="block space-y-1.5">
      <div
        className={`
          flex
          items-center
          rounded-2xl
          border
          bg-muted/20
          transition-colors
          ${
            error || isValid === false
              ? "border-red-500"
              : "border-border/80 focus-within:border-purple-600"
          }
        `}
      >
        {/* Country */}
        <div className="relative shrink-0">
          <select
            value={country}
            disabled={disabled}
            onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
            className="
              appearance-none
              bg-transparent
              pl-4
              pr-8
              py-3
              text-sm
              font-bold
              text-foreground
              outline-none
              cursor-pointer
              disabled:cursor-not-allowed
            "
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {item.flag} {item.dialCode}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Phone number */}
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={onBlur}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="
            min-w-0
            flex-1
            bg-transparent
            px-4
            py-3
            text-sm
            font-bold
            text-foreground
            outline-none
            placeholder:text-muted-foreground/60
          "
        />

        {/* Validation indicator */}
        {phone && (
          <div className="pr-4">
            {isValid === true && <span className="text-green-600">✓</span>}

            {isValid === false && <span className="text-red-500">!</span>}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

      {!error && isValid === false && phone && (
        <p className="text-xs font-semibold text-red-500">
          Please enter a valid phone number.
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
