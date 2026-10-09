import axios from "axios";

const TOKEN_KEY = "user_token";
// tokens last 24h, swap for a new one once less than this is left
const RENEW_WHEN_LEFT_MS = 12 * 60 * 60 * 1000;

let renewing: Promise<void> | null = null;

const expiresAt = (token: string): number | null => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
};

const renew = async (token: string) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
      null,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const fresh = res.data?.accessToken;
    if (fresh && sessionStorage.getItem(TOKEN_KEY) === token) {
      sessionStorage.setItem(TOKEN_KEY, fresh);
    }
  } catch {
    // keep the old token, next request tries again
  }
};

export const renewTokenIfNeeded = async () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return;
  const exp = expiresAt(token);
  if (exp === null || exp <= Date.now() || exp - Date.now() > RENEW_WHEN_LEFT_MS)
    return;
  renewing ??= renew(token).finally(() => {
    renewing = null;
  });
  await renewing;
};
