export const logout = () => {
  sessionStorage.removeItem("user_token");
  sessionStorage.removeItem("hangaut_user");
  window.location.href = "/";
};
