import { adminCaller } from "../interceptors/http";

export type LiveComment = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

export type LiveSignal = {
  viewerId: string;
  kind: "offer" | "answer" | "ice";
  payload: string;
  seq: number;
};

export type LiveState = {
  live: boolean;
  started: boolean;
  ended: boolean;
  loves: number;
  loved: boolean;
  full: boolean;
  watching: number;
  comments: LiveComment[];
  signals: LiveSignal[];
};

export type LiveParty = {
  id: string;
  title: string;
  image: string;
  location: string;
  ownerId: string;
  hostName: string;
};

const viewerKey = "hangaut_live_viewer";

export const liveViewerId = () => {
  const saved = localStorage.getItem(viewerKey);
  if (saved && /^[a-zA-Z0-9_-]{8,40}$/.test(saved)) return saved;
  const next = `v${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`.slice(0, 40);
  localStorage.setItem(viewerKey, next);
  return next;
};

const dataOf = <T>(response: { data: T }) => response.data;

export const fetchLiveParties = () =>
  adminCaller.get<{ parties: LiveParty[] }>("/live/parties").then(dataOf);

export const fetchLive = (partyId: string, viewerId: string, after: number, key?: string) =>
  adminCaller
    .get<LiveState>(`/parties/${partyId}/live`, {
      params: { viewer: viewerId, after, key: key || undefined },
    })
    .then(dataOf);

export const fetchHostFeed = (partyId: string, after: number) =>
  adminCaller
    .get<{ viewers: string[]; signals: LiveSignal[] }>(`/parties/${partyId}/live/host`, {
      params: { after },
    })
    .then(dataOf);

export const startLive = (partyId: string) =>
  adminCaller.post(`/parties/${partyId}/live/start`).then(dataOf);

export const stopLive = (partyId: string) =>
  adminCaller.post(`/parties/${partyId}/live/stop`).then(dataOf);

/** Still goes out if the phone is closing the page. */
export const stopLiveNow = (partyId: string) => {
  const base = import.meta.env.VITE_BASE_URL ?? "";
  const token = sessionStorage.getItem("user_token");
  void fetch(`${base}/parties/${partyId}/live/stop`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).catch(() => undefined);
};

export const sendHostSignal = (
  partyId: string,
  viewerId: string,
  kind: "offer" | "ice",
  payload: string,
) => adminCaller.post(`/parties/${partyId}/live/host-signal`, { viewerId, kind, payload });

export const sendViewerSignal = (
  partyId: string,
  viewerId: string,
  kind: "answer" | "ice",
  payload: string,
  key?: string,
) => adminCaller.post(`/parties/${partyId}/live/signal`, { viewerId, kind, payload, key });

export const sendLiveComment = (partyId: string, viewerId: string, text: string, name: string, key?: string) =>
  adminCaller
    .post<LiveComment>(`/parties/${partyId}/live/comments`, { viewerId, text, name, key })
    .then(dataOf);

export const toggleLiveLove = (partyId: string, viewerId: string, key?: string) =>
  adminCaller
    .post<{ loves: number; loved: boolean }>(`/parties/${partyId}/live/love`, { viewerId, key })
    .then(dataOf);
