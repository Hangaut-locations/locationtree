import { adminCaller } from "../interceptors/http";

export type MediaKind = "photo" | "video";
export type MediaListing = "property" | "party";

/** Has to match MAX_VIDEO_SECONDS on the API. */
export const MAX_VIDEO_SECONDS = 62;
/** Cloudinary's free plan won't take a bigger video. */
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

interface UploadSignature {
  upload_url: string;
  api_key: string;
  signature: string;
  params: Record<string, string>;
}

export interface UploadedMedia {
  public_id: string;
  secure_url: string;
  duration?: number;
}

/** Sends the file straight to Cloudinary (signed by our API), so big files never go through Render. */
export const uploadMedia = async (
  file: Blob,
  kind: MediaKind,
  listing: MediaListing,
  onProgress?: (fraction: number) => void,
): Promise<UploadedMedia> => {
  const { data: signed } = await adminCaller.post<UploadSignature>(
    "/media/upload-signature",
    { kind, listing },
  );

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.params)) {
    form.append(key, value);
  }
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
      let body: (UploadedMedia & { error?: { message?: string } }) | null =
        null;
      try {
        body = JSON.parse(request.responseText);
      } catch {
        body = null;
      }
      if (request.status >= 200 && request.status < 300 && body) {
        resolve(body);
      } else {
        reject(new Error(body?.error?.message ?? "Upload failed, try again"));
      }
    };
    request.onerror = () =>
      reject(new Error("Upload failed, check your connection"));
    request.send(form);
  });
};

/** Reads the length of a picked video, or null if this browser can't open it. */
export const videoLength = (file: File) =>
  new Promise<number | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? video.duration : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });

export const formatVideoLength = (seconds: number) => {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

/** In the gallery the video sits right after the cover photo. */
export const videoSlide = (photoCount: number) => (photoCount > 0 ? 1 : 0);

export const photoSlide = (photoIndex: number, hasVideo: boolean) =>
  hasVideo && photoIndex > 0 ? photoIndex + 1 : photoIndex;
