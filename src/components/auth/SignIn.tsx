import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import type React from "react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { DialogTitle } from "../../../components/ui/dialog";
import type { AuthScreen } from "../AuthModal";
import { axiosClient } from "../../interceptors/http";
import { rememberLogin } from "../../lib/tokenRenew";
import { getErrorMessage } from "../../lib/errors";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CodeInput, emptyCode } from "./CodeInput";

interface AuthModalProps {
  screen: AuthScreen;
  setScreen: Dispatch<SetStateAction<AuthScreen>>;
  onClose?: () => void;
  codeEmail: string;
  setCodeEmail: (email: string) => void;
}

const RESEND_SECONDS = 60;

const primaryButton =
  "w-full rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3.5 px-6 shadow-md transition-[transform,background-color] duration-160 ease-out active:scale-97 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-base text-center";

export const SignIn: React.FC<AuthModalProps> = ({
  setScreen,
  onClose,
  screen,
  codeEmail,
  setCodeEmail,
}) => {
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login Form States
  const [email, setEmail] = useState(codeEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  // Code from the email (6 digits)
  const [code, setCode] = useState<string[]>(emptyCode);
  const [resendIn, setResendIn] = useState(0);

  // Reset Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const qc = useQueryClient();

  const codeValue = code.join("");

  // a code was just sent when we land on a code screen
  useEffect(() => {
    if (screen === "verify" || screen === "reset-code") {
      setCode(emptyCode());
      setResendIn(RESEND_SECONDS);
    }
  }, [screen]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const finishLogin = (data: {
    accessToken: string;
    refreshToken?: string;
    user: unknown;
  }) => {
    sessionStorage.setItem("user_token", data.accessToken);
    sessionStorage.setItem("hangaut_user", JSON.stringify(data.user));
    rememberLogin(data.refreshToken);
    qc.invalidateQueries({ queryKey: ["me"] });
    toast.success("You are in, enjoy your session");
    if (onClose) {
      onClose();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    axiosClient
      .post("/auth/login", {
        email,
        password,
        remember,
      })
      .then((res) => finishLogin(res.data))
      .catch((err) => {
        const needsCode = err?.response?.data?.data?.verification_required;
        if (needsCode) {
          // accounts confirm their email with a code before they can log in
          setCodeEmail(err.response.data.data.email ?? email);
          setScreen("verify");
          toast.success("Confirm your email, we sent you a code");
          return;
        }
        toast.error(getErrorMessage(err, "Error logging in, try again"));
      })
      .finally(() => setLoading(false));
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    axiosClient
      .post("/auth/verify-email", {
        email: codeEmail,
        code: codeValue,
        remember,
      })
      .then((res) => finishLogin(res.data))
      .catch((err) => {
        setCode(emptyCode());
        toast.error(getErrorMessage(err, "That code didn't work, try again"));
      })
      .finally(() => setLoading(false));
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    axiosClient
      .post("/auth/forgot-password", { email })
      .then(() => {
        setCodeEmail(email);
        setScreen("reset-code");
      })
      .catch((err) => {
        toast.error(getErrorMessage(err, "Couldn't send the code, try again"));
      })
      .finally(() => setLoading(false));
  };

  const handleResetCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    axiosClient
      .post("/auth/reset-password/check", {
        email: codeEmail,
        code: codeValue,
      })
      .then(() => setScreen("new-password"))
      .catch((err) => {
        setCode(emptyCode());
        toast.error(getErrorMessage(err, "That code didn't work, try again"));
      })
      .finally(() => setLoading(false));
  };

  const resendCode = () => {
    axiosClient
      .post("/auth/resend-code", {
        email: codeEmail,
        purpose: screen === "reset-code" ? "reset" : "verify",
      })
      .then(() => {
        setCode(emptyCode());
        setResendIn(RESEND_SECONDS);
        toast.success("New code sent");
      })
      .catch((err) => {
        const wait = err?.response?.data?.data?.retry_in;
        if (wait) setResendIn(wait);
        toast.error(getErrorMessage(err, "Couldn't send a new code"));
      });
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    setPasswordsMatch(true);
    setLoading(true);
    axiosClient
      .post("/auth/reset-password", {
        email: codeEmail,
        code: codeValue,
        password: newPassword,
      })
      .then(() => setScreen("success"))
      .catch((err) => {
        const message = getErrorMessage(err, "Couldn't change the password");
        toast.error(message);
        // an old or used up code means starting over from the email
        if (/code/i.test(message)) setScreen("reset-code");
      })
      .finally(() => setLoading(false));
  };

  const handleSuccessClick = () => {
    setEmail(codeEmail);
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setScreen("login");
  };

  const backToLogin = (
    <button
      type="button"
      onClick={() => setScreen("login")}
      className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to sign in
    </button>
  );

  const codeScreen = (
    title: string,
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string,
  ) => (
    <form onSubmit={onSubmit} className="w-full max-w-md mx-auto space-y-8">
      <div className="space-y-1.5 text-left">
        {backToLogin}
        <DialogTitle className="pt-2 text-2xl font-bold text-foreground tracking-tight">
          {title}
        </DialogTitle>
        <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
          Enter the 6 digit code we sent to{" "}
          <span className="text-foreground">{codeEmail}</span>. Check your spam
          folder if you can't find it.
        </p>
      </div>

      <CodeInput value={code} onChange={setCode} />

      <div className="space-y-6">
        <div className="text-center text-sm font-bold text-foreground">
          Didn’t receive code?{" "}
          <button
            type="button"
            onClick={resendCode}
            disabled={resendIn > 0}
            className="text-purple-750 dark:text-purple-300 hover:underline font-bold cursor-pointer disabled:cursor-default disabled:text-muted-foreground disabled:no-underline"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend Code"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || codeValue.length < code.length}
          className={primaryButton}
        >
          {loading ? "Checking..." : submitLabel}
        </button>
      </div>
    </form>
  );

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
              onClick={() => setScreen("forgot")}
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

      {/* Confirm the email: after signup, or logging in before confirming */}
      {screen === "verify" &&
        codeScreen("Confirm your email", handleVerifySubmit, "Verify")}

      {/* Forgot password: which email */}
      {screen === "forgot" && (
        <form
          onSubmit={handleForgotSubmit}
          className="w-full max-w-md mx-auto space-y-6"
        >
          <div className="space-y-1.5 text-left">
            {backToLogin}
            <DialogTitle className="pt-2 text-2xl font-bold text-foreground tracking-tight">
              Forgot your password?
            </DialogTitle>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
              Enter the email on your account and we'll send you a code to set
              a new password.
            </p>
          </div>

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

          <button type="submit" disabled={loading} className={primaryButton}>
            {loading ? "Sending..." : "Send code"}
          </button>
        </form>
      )}

      {/* Code for the password reset */}
      {screen === "reset-code" &&
        codeScreen("Input code", handleResetCodeSubmit, "Verify")}

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
            <p className="text-xs font-medium text-muted-foreground">
              Use upper and lower case letters, a number and a special character
              (@$!%*?&)
            </p>
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
                minLength={8}
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
          <button type="submit" disabled={loading} className={primaryButton}>
            {loading ? "Saving..." : "Reset"}
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
          <p className="-mt-4 text-center text-sm font-semibold text-muted-foreground">
            Sign in with your new password.
          </p>

          <button
            type="button"
            onClick={handleSuccessClick}
            className={primaryButton}
          >
            Sign in
          </button>
        </div>
      )}
    </main>
  );
};
