import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

/** Sends logged-out visitors to `redirectTo` (replacing the current page). */
const useRequireLogin = (redirectTo: string) => {
  const { data, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !data) navigate(redirectTo, { replace: true });
  }, [isLoading, data, navigate, redirectTo]);
};

export default useRequireLogin;
