import axios from "axios";

const TOKEN_KEY = "user_token";
// remember me: kept in localStorage so it survives closing the browser
const REMEMBER_KEY = "hangaut_remember";
// tokens last 24h, swap for a new one once less than this is left
const RENEW_WHEN_LEFT_MS = 12 * 60 * 60 * 1000;

const apiUrl = (path: string) => `${import.meta.env.VITE_BASE_URL}${path}`;

let renewing: Promise<boolean> | null = null;

const expiresAt = (token: string): number | null => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const rememberLogin = (refreshToken?: string) => {
  if (refreshToken) localStorage.setItem(REMEMBER_KEY, refreshToken);
  else localStorage.removeItem(REMEMBER_KEY);
};

/** Ends the remembered login on this device (api + storage). */
export const forgetLogin = () => {
  const refreshToken = localStorage.getItem(REMEMBER_KEY);
  if (!refreshToken) return;
  localStorage.removeItem(REMEMBER_KEY);
  fetch(apiUrl("/auth/logout"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    keepalive: true,
  }).catch(() => {});
};

const fromRememberedLogin = async (refreshToken: string) => {
  try {
    const res = await axios.post(apiUrl("/auth/session/refresh"), {
      refreshToken,
    });
    const fresh = res.data?.accessToken;
    if (!fresh) return false;
    sessionStorage.setItem(TOKEN_KEY, fresh);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(REMEMBER_KEY);
    }
    return false;
  }
};

const fromCurrentToken = async (token: string) => {
  try {
    const res = await axios.post(apiUrl("/auth/refresh"), null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fresh = res.data?.accessToken;
    if (fresh && sessionStorage.getItem(TOKEN_KEY) === token) {
      sessionStorage.setItem(TOKEN_KEY, fresh);
    }
    return Boolean(fresh);
  } catch {
    // keep the old token, next request tries again
    return false;
  }
};

const runOnce = (job: () => Promise<boolean>) => {
  renewing ??= job().finally(() => {
    renewing = null;
  });
  return renewing;
};

/** Gets a new token from the remembered login, e.g. after the api said the old one expired. */
export const restoreLogin = () => {
  const refreshToken = localStorage.getItem(REMEMBER_KEY);
  if (!refreshToken) return Promise.resolve(false);
  return runOnce(() => fromRememberedLogin(refreshToken));
};

export const renewTokenIfNeeded = async () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const exp = token ? expiresAt(token) : null;
  const left = exp === null ? 0 : exp - Date.now();
  if (token && exp !== null && left > RENEW_WHEN_LEFT_MS) return;

  const refreshToken = localStorage.getItem(REMEMBER_KEY);
  if (refreshToken) {
    await runOnce(() => fromRememberedLogin(refreshToken));
    return;
  }
  if (token && left > 0) {
    await runOnce(() => fromCurrentToken(token));
  }
};
