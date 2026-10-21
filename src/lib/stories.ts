import { adminCaller } from "../interceptors/http";
import { liveViewerId } from "./live";
import type { MediaKind, UploadedMedia } from "./media";

export type StoryComment = {
  id: string;
  name: string;
  location?: string;
  text: string;
  createdAt: string;
};

export type StoryItem = {
  id: string;
  kind: "photo" | "video";
  url: string;
  poster?: string;
  createdAt: string;
  loves: number;
  loved: boolean;
  comments: StoryComment[];
};

export type StoryPerson = {
  userId: string;
  firstName: string;
  lastName: string;
  items: StoryItem[];
};

const dataOf = <T>(response: { data: T }) => response.data;

/** Same browser id the live comments use, so a visitor can love a story without an account. */
export const storyViewerId = liveViewerId;

export const storyList = (viewerId: string) =>
  adminCaller
    .get<{ people: StoryPerson[] }>("/stories", { params: { viewerId } })
    .then(dataOf);

/** Story uploads use their own signature so listing cleanup never touches them. */
export const uploadStory = async (
  file: Blob,
  kind: MediaKind,
  onProgress?: (fraction: number) => void,
): Promise<UploadedMedia> => {
  const signed = await adminCaller
    .post("/stories/upload-signature", { kind })
    .then(dataOf<{ upload_url: string; api_key: string; signature: string; params: Record<string, string> }>);

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.params)) form.append(key, value);
  form.append("api_key", signed.api_key);
  form.append("signature", signed.signature);
  form.append("file", file);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", signed.upload_url);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    request.onload = () => {
      let body: (UploadedMedia & { error?: { message?: string } }) | null = null;
      try {
        body = JSON.parse(request.responseText);
      } catch {
        body = null;
      }
      if (request.status >= 200 && request.status < 300 && body?.public_id) {
        resolve(body);
      } else {
        reject(new Error(body?.error?.message ?? "Upload failed, try again"));
      }
    };
    request.onerror = () => reject(new Error("Upload failed, check your connection"));
    request.send(form);
  });
};

export const saveStory = (publicId: string, kind: MediaKind) =>
  adminCaller.post("/stories", { publicId, kind }).then(dataOf<{ id: string }>);

export const deleteStory = (id: string) => adminCaller.delete(`/stories/${id}`);

export const commentOnStory = (
  id: string,
  viewerId: string,
  text: string,
  location: string,
) =>
  adminCaller
    .post<StoryComment>(`/stories/${id}/comments`, {
      viewerId,
      text,
      location: location || undefined,
    })
    .then(dataOf);

export const loveStory = (id: string, viewerId: string) =>
  adminCaller
    .post<{ loved: boolean; loves: number }>(`/stories/${id}/love`, { viewerId })
    .then(dataOf);
