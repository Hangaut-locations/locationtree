import { adminCaller } from "../interceptors/http";

export type ChatListingType = "party" | "property";

export interface ChatPerson {
  _id: string;
  firstName: string;
  lastName: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ChatListing {
  type: ChatListingType;
  id: string;
  title: string;
  image?: string;
}

export interface ChatSummary {
  _id: string;
  person: ChatPerson | null;
  listing: ChatListing | null;
  lastMessage: {
    kind: "text" | "photo" | "location";
    text: string;
    mine: boolean;
    at: string;
  } | null;
  unread: number;
}

export interface ChatDetails extends ChatSummary {
  seenAt: string | null;
  blockedByMe: boolean;
  canMessage: boolean;
}

export interface ChatLocation {
  lat: number;
  lng: number;
  live_until: string | null;
  live: boolean;
}

export interface ChatMessage {
  _id: string;
  kind: "text" | "photo" | "location";
  text: string;
  photo: string | null;
  location: ChatLocation | null;
  mine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatPage {
  conversation: ChatDetails;
  messages: ChatMessage[];
  hasMore: boolean;
  now: string;
}

export const chatName = (person: ChatPerson | null) =>
  person ? `${person.firstName} ${person.lastName}`.trim() : "Hangaut user";

export const chatPreview = (last: ChatSummary["lastMessage"]) => {
  if (!last) return "No messages yet";
  if (last.kind === "photo") return "Sent a photo";
  if (last.kind === "location") return "Shared a location";
  return last.text;
};

export const unreadCount = () =>
  adminCaller
    .get<{ chats: number; messages: number }>("/chat/unread")
    .then((res) => res.data);

export const listChats = () =>
  adminCaller.get<ChatSummary[]>("/chat/conversations").then((res) => res.data);

export const startChat = (body: {
  userId: string;
  listingType: ChatListingType;
  listingId: string;
  key?: string;
}) =>
  adminCaller
    .post<ChatDetails>("/chat/conversations", body)
    .then((res) => res.data);

export const getMessages = (
  id: string,
  params?: { since?: string; before?: string },
) =>
  adminCaller
    .get<ChatPage>(`/chat/conversations/${id}/messages`, { params })
    .then((res) => res.data);

export const sendMessage = (
  id: string,
  body: {
    text?: string;
    photo?: string;
    location?: { lat: number; lng: number; live_minutes?: 15 | 60 | 480 };
  },
) =>
  adminCaller
    .post<ChatMessage>(`/chat/conversations/${id}/messages`, body)
    .then((res) => res.data);

export const markChatRead = (id: string) =>
  adminCaller.post(`/chat/conversations/${id}/read`);

export const moveLiveLocation = (id: string, lat: number, lng: number) =>
  adminCaller
    .patch<ChatMessage>(`/chat/messages/${id}/location`, { lat, lng })
    .then((res) => res.data);

export const stopLiveLocation = (id: string) =>
  adminCaller
    .delete<ChatMessage>(`/chat/messages/${id}/location`)
    .then((res) => res.data);

export const blockPerson = (userId: string) =>
  adminCaller.post(`/chat/blocked/${userId}`);

export const unblockPerson = (userId: string) =>
  adminCaller.delete(`/chat/blocked/${userId}`);

export const reportPerson = (body: {
  userId: string;
  conversationId?: string;
  reason: "spam" | "scam" | "harassment" | "inappropriate" | "other";
  details?: string;
}) => adminCaller.post("/chat/reports", body);

/** Chat photos use their own signature, outside the listing folders. */
export const uploadChatPhoto = async (file: File): Promise<string> => {
  const { data: signed } = await adminCaller.post<{
    upload_url: string;
    api_key: string;
    signature: string;
    params: Record<string, string>;
  }>("/chat/photo-signature");

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.params)) form.append(key, value);
  form.append("api_key", signed.api_key);
  form.append("signature", signed.signature);
  form.append("file", file);

  const response = await fetch(signed.upload_url, { method: "POST", body: form });
  const body = (await response.json()) as { public_id?: string; error?: { message?: string } };
  if (!response.ok || !body.public_id) {
    throw new Error(body.error?.message ?? "Upload failed, try again");
  }
  return body.public_id;
};
