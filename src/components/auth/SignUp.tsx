import {
  Eye,
  EyeOff,
  LocateIcon,
  Lock,
  Mail,
  User,
  UserCircleIcon,
} from "lucide-react";
import type React from "react";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { AuthScreen } from "../AuthModal";
import { axiosClient } from "../../interceptors/http";
import toast from "react-hot-toast";
import LocationSelect from "../global/LocationSelect";

interface AuthModalProps {
  onClose?: () => void;
  setScreen: Dispatch<SetStateAction<AuthScreen>>;
}

export const SignUp: React.FC<AuthModalProps> = ({ setScreen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    axiosClient
      .post("/auth/register", {
        email,
        password,
        firstName,
        lastName,
        address,
        city,
        country,
        state,
        bio,
      })
      .then((res) => {
        toast.success("Your account is registered successfully");
        sessionStorage.setItem("user_token", res.data?.accessToken);
        sessionStorage.setItem("hangaut_user", JSON.stringify(res.data?.user));
        if (onClose) {
          onClose();
        }
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        if (onClose) {
          onClose();
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error registering in");
      })
      .finally(() => setLoading(false));
  };

  return (
    <main>
      <form onSubmit={handleSignUpSubmit} className="w-full space-y-6">
        <div className="space-y-1.5 text-left">
          <h1 className="text-2xl font-medium text-foreground tracking-tight">
            Create an account
          </h1>
          <p className="text-xs font-medium text-muted-foreground">
            Kindly fill in all fields below correctly
          </p>
        </div>

        {/* Input fields container */}
        <div className="space-y-3">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name field */}
            <div className="flex items-center gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
              <User className="h-5 w-5 text-muted-foreground" />
              <input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
              />
            </div>

            <div className="flex items-center gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
              <User className="h-5 w-5 text-muted-foreground" />
              <input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="flex items-center gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
            />
          </div>

          {/* Bio field */}
          <div className="flex items-start justify-start gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
            <UserCircleIcon className="h-5 w-5 text-muted-foreground" />
            <textarea
              placeholder="Enter your bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
            />
          </div>

          <LocationSelect
            // label="Country"
            value={country as string}
            onChange={(value) => setCountry(value)}
            type="country"
            className="w-full bg-[#F4F3EC] rounded-lg text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
          />
          <div className="w-full grid md:grid-cols-2 gap-4">
            <LocationSelect
              // label="State"
              country={country}
              value={state as string}
              onChange={(value) => setState(value)}
              className="w-full bg-[#F4F3EC] rounded-lg text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
              type="state"
            />
            <LocationSelect
              country={country}
              state={state}
              placeholder="Select city"
              // label="City"
              value={city as string}
              onChange={(value) => setCity(value)}
              className="w-full bg-[#F4F3EC] rounded-lg text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
              type="city"
            />
          </div>

          {/* Address field */}
          <div className="flex items-center gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
            <LocateIcon className="h-5 w-5 text-muted-foreground" />
            <input
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
            />
          </div>

          {/* Password field */}
          <div className="flex items-center gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none border-none p-0 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Action Submit Button */}
        <button
          disabled={loading}
          type="submit"
          className="disabled:opacity-55 disabled:cursor-not-allowed w-full rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-medium py-3.5 px-6 shadow-md transition-[transform,background-color] duration-160 ease-out active:scale-97 cursor-pointer text-base text-center"
        >
          {loading ? "Signing up" : "Sign Up"}
        </button>

        {/* Swap Trigger footer */}
        <div className="text-center text-xs font-semibold text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setScreen("login")}
            className="text-purple-700 dark:text-purple-300 font-medium hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </form>
    </main>
  );
};
