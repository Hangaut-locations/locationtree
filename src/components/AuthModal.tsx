import type React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../../components/ui/dialog";
import { SignIn } from "./auth/SignIn";
import { SignUp } from "./auth/SignUp";
import useAppContext from "./hooks/useAppContext";

export type AuthScreen =
  | "login"
  | "verify"
  | "forgot"
  | "reset-code"
  | "new-password"
  | "success"
  | "signup";

export const AuthModal: React.FC = () => {
  const { isAuthModal, setIsAuthModal } = useAppContext();
  const [screen, setScreen] = useState<AuthScreen>("login");
  // the email the code went to, shared by signup, login and forgot password
  const [codeEmail, setCodeEmail] = useState("");

  const onClose = () => {
    setIsAuthModal(false);
  };

  // Sync state on open
  useEffect(() => {
    if (isAuthModal) {
      setScreen("login");
      setCodeEmail("");
    }
  }, [isAuthModal]);

  return (
    <Dialog open={isAuthModal} onOpenChange={(open) => !open && onClose()}>
      <div className="">
        <DialogContent className="max-h-[95vh] w-full max-w-full sm:max-w-lg h-max rounded-none sm:rounded-[32px] border-t sm:border border-border bg-card p-5 sm:p-9 md:p-12 shadow-2xl animate-in fade-in sm:zoom-in-95 duration-200 top-0 left-0 sm:top-1/2 sm:left-1/2 translate-x-0 translate-y-0 sm:-translate-x-1/2 sm:-translate-y-1/2 overflow-y-auto">
          {screen !== "signup" && (
            <SignIn
              onClose={onClose}
              screen={screen}
              setScreen={setScreen}
              codeEmail={codeEmail}
              setCodeEmail={setCodeEmail}
            />
          )}
          {screen === "signup" && (
            <SignUp
              onClose={onClose}
              setScreen={setScreen}
              setCodeEmail={setCodeEmail}
            />
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
};
