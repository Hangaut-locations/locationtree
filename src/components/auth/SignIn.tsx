import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import type React from "react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { DialogTitle } from "../../../components/ui/dialog";
import type { AuthScreen } from "../AuthModal";
import { axiosClient } from "../../interceptors/http";
import { rememberLogin } from "../../lib/tokenRenew";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AuthModalProps {
  screen: AuthScreen;
  setScreen: Dispatch<SetStateAction<AuthScreen>>;
  onClose?: () => void;
}

export const SignIn: React.FC<AuthModalProps> = ({
  setScreen,
  onClose,
  screen,
}) => {
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  // Verification Code States (4 digits)
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const qc = useQueryClient();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    //  axios
    //   .post(`${import.meta.env.VITE_BASE_URL}/auth/login`, {
    axiosClient
      .post("/auth/login", {
        email,
        password,
        remember,
      })
      .then((res) => {
        // console.log("login response", res.data);
        sessionStorage.setItem("user_token", res.data?.accessToken);
        sessionStorage.setItem("hangaut_user", JSON.stringify(res.data?.user));
        rememberLogin(res.data?.refreshToken);
        qc.invalidateQueries({ queryKey: ["me"] });
        toast.success("You are in, enjoy your session");
        if (onClose) {
          onClose();
        }
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Error logging in, try again",
        );
      })
      .finally(() => setLoading(false));
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScreen("new-password");
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    setPasswordsMatch(true);
    setScreen("success");
  };

  const handleSuccessClick = () => {
    // onLoginSuccess(email || "guest@hangout.com");
    if (onClose) {
      onClose();
    }
  };

  // Shift focus inside verification input blocks
  const handleCodeChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // Allow numbers only

    const newCode = [...code];
    newCode[index] = val.slice(-1); // Capture last digit
    setCode(newCode);

    if (val && index < 3) {
      codeRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs[index - 1].current?.focus();
    }
  };

  // Sync state on open
  useEffect(() => {
    setEmail("");
    setPassword("");
    setCode(["", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordsMatch(true);
  }, []);

  return (
    <main>
      {screen === "login" && (
        <form onSubmit={handleLoginSubmit} className="w-full space-y-6">
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs font-medium text-muted-foreground">
              Enter your credentials below to sign in to your account
            </p>
          </div>

          {/* Input fields container */}
          <div className="space-y-3">
            {/* Email field */}
            <div className="flex items-center gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0"
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
                className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0"
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
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-55 disabled:cursor-not-allowed rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3.5 px-6 shadow-md transition-[transform,background-color] duration-160 ease-out active:scale-97 cursor-pointer text-base text-center"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Checkbox and Forgot Password */}
          <div className="flex items-center justify-between text-xs font-bold px-1">
            <label className="flex items-center gap-2 text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4.5 w-4.5 rounded-md border-border bg-card text-purple-950 focus:ring-purple-950 accent-purple-950 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setScreen("verify")}
              className="text-purple-750 dark:text-purple-300 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Swap Trigger footer */}
          <div className="text-center text-xs font-semibold text-muted-foreground">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => setScreen("signup")}
              className="text-purple-750 dark:text-purple-300 font-bold hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </form>
      )}

      {/* Screen 2: Verification Code Input */}
      {screen === "verify" && (
        <form
          onSubmit={handleVerifySubmit}
          className="w-full max-w-md mx-auto space-y-8"
        >
          <div className="space-y-1.5 text-left">
            <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
              Input code
            </DialogTitle>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed whitespace-pre-line">
              Please enter the code sent to the email account. {"\n"}check spam
              folder
            </p>
          </div>

          {/* Code Inputs Grid */}
          <div className="flex justify-center gap-3">
            {code.map((val, idx) => (
              <input
                key={idx}
                ref={codeRefs[idx]}
                type="text"
                maxLength={1}
                value={val}
                onChange={(e) => handleCodeChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="h-14 w-14 rounded-2xl border border-border/80 bg-card text-center text-xl font-bold text-foreground focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          <div className="space-y-6">
            {/* Resend Link */}
            <div className="text-center text-sm font-bold text-foreground">
              Didn’t receive code?{" "}
              <button
                type="button"
                onClick={() => alert("Code resent!")}
                className="text-purple-750 dark:text-purple-300 hover:underline font-bold cursor-pointer"
              >
                Resend Code
              </button>
            </div>

            {/* Verify submit button */}
            <button
              type="submit"
              disabled={code.some((v) => !v)}
              className="w-full rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3.5 px-6 shadow-md transition-[transform,background-color] duration-160 ease-out active:scale-97 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-base text-center"
            >
              Verify
            </button>
          </div>
        </form>
      )}

      {/* Screen 3: Create a New Password */}
      {screen === "new-password" && (
        <form
          onSubmit={handleNewPasswordSubmit}
          className="w-full max-w-md mx-auto space-y-6"
        >
          <div className="space-y-1.5 text-left">
            <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
              Create a new password
            </DialogTitle>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* New Password input */}
            <div className="flex items-center gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0"
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

            {/* Confirm Password input */}
            <div className="flex items-center gap-3 border border-border/80 bg-[#f4f3ec] dark:bg-muted/30 rounded-2xl px-4 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Matching errors */}
          {!passwordsMatch && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <span>Passwords do not match</span>
            </div>
          )}

          {/* Submit Reset Button */}
          <button
            type="submit"
            className="w-full rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3.5 px-6 shadow-md transition-[transform,background-color] duration-160 ease-out active:scale-97 cursor-pointer text-base text-center"
          >
            Reset
          </button>
        </form>
      )}

      {/* Screen 4: Password Reset Successful */}
      {screen === "success" && (
        <div className="w-full max-w-md mx-auto space-y-8 py-4 flex flex-col items-center">
          {/* Header Success Text */}
          <DialogTitle className="text-xl font-bold text-purple-950 dark:text-purple-300 tracking-tight text-center underline decoration-2 underline-offset-4">
            Password reset successful
          </DialogTitle>

          {/* Complete submit Reset Button */}
          <button
            type="button"
            onClick={handleSuccessClick}
            className="w-full rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3.5 px-6 shadow-md transition-[transform,background-color] duration-160 ease-out active:scale-97 cursor-pointer text-base text-center"
          >
            Reset
          </button>
        </div>
      )}
    </main>
  );
};
