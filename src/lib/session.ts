import { forgetLogin } from "./tokenRenew";

export const SESSION_ENDED_EVENT = "hangaut:session-ended";

export const logout = () => {
  forgetLogin();
  sessionStorage.removeItem("user_token");
  sessionStorage.removeItem("hangaut_user");
  window.location.href = "/";
};
