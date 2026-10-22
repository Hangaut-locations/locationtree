import { adminCaller } from "../interceptors/http";
import type { UploadedMedia } from "./media";

const dataOf = <T>(response: { data: T }) => response.data;

type SignedUpload = {
  upload_url: string;
  api_key: string;
  signature: string;
  params: Record<string, string>;
};

/** Sends the photo to Cloudinary, then saves it as this person's profile picture. */
export const saveProfilePhoto = async (file: File) => {
  const signed = await adminCaller
    .post<SignedUpload>("/users/profile/photo-signature")
    .then(dataOf);

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.params)) form.append(key, value);
  form.append("api_key", signed.api_key);
  form.append("signature", signed.signature);
  form.append("file", file);

  const uploaded = await new Promise<UploadedMedia>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", signed.upload_url);
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

  return adminCaller
    .post("/users/profile/photo", { publicId: uploaded.public_id })
    .then(dataOf);
};
