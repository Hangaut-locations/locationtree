import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { compressImage } from "../../lib/images";
import {
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  type MediaListing,
  uploadMedia,
  videoLength,
} from "../../lib/media";
import type { ListingVideo } from "../../types/listing";

export interface PendingPhoto {
  id: string;
  preview: string;
  progress: number;
}

export interface VideoUpload {
  name: string;
  progress: number;
}

/**
 * Photos and the video for the listing wizards. Lives in the wizard (not the step)
 * so uploads keep going while the host moves between steps.
 */
const useListingMedia = (listing: MediaListing) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [pending, setPending] = useState<PendingPhoto[]>([]);
  const [video, setVideo] = useState<ListingVideo | null>(null);
  const [videoUpload, setVideoUpload] = useState<VideoUpload | null>(null);
  const localVideo = useRef<string | null>(null);

  const dropLocalVideo = () => {
    if (localVideo.current) URL.revokeObjectURL(localVideo.current);
    localVideo.current = null;
  };
  useEffect(() => dropLocalVideo, []);

  const setPhotoProgress = (id: string, progress: number) =>
    setPending((prev) =>
      prev.map((photo) => (photo.id === id ? { ...photo, progress } : photo)),
    );

  const addPhotos = useCallback(
    async (files: File[]) => {
      const queued = files
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => ({
          file,
          id: crypto.randomUUID(),
          preview: URL.createObjectURL(file),
        }));
      if (!queued.length) return;
      setPending((prev) => [
        ...prev,
        ...queued.map(({ id, preview }) => ({ id, preview, progress: 0 })),
      ]);

      const uploads = queued.map(async ({ file, id }) => {
        const small = await compressImage(file);
        const blob = await (await fetch(small)).blob();
        const uploaded = await uploadMedia(blob, "photo", listing, (done) =>
          setPhotoProgress(id, done),
        );
        return uploaded.secure_url;
      });

      // Added in the order they were picked, even if a later one finishes first.
      let failed = 0;
      for (const [index, upload] of uploads.entries()) {
        const { id, preview } = queued[index];
        try {
          const url = await upload;
          setPhotos((prev) => [...prev, url]);
        } catch {
          failed++;
        }
        setPending((prev) => prev.filter((photo) => photo.id !== id));
        URL.revokeObjectURL(preview);
      }
      if (failed) {
        toast.error(
          failed === 1
            ? "One photo didn't upload, try adding it again."
            : `${failed} photos didn't upload, try adding them again.`,
        );
      }
    },
    [listing],
  );

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index));

  const addVideo = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        toast.error("Pick a video file.");
        return;
      }
      if (file.size > MAX_VIDEO_BYTES) {
        toast.error("That video is over 100MB, try a shorter or smaller one.");
        return;
      }
      const seconds = await videoLength(file);
      if (seconds !== null && seconds > MAX_VIDEO_SECONDS) {
        toast.error("Keep the video to 1 minute or less.");
        return;
      }

      setVideoUpload({ name: file.name, progress: 0 });
      try {
        const uploaded = await uploadMedia(file, "video", listing, (done) =>
          setVideoUpload({ name: file.name, progress: done }),
        );
        dropLocalVideo();
        localVideo.current = URL.createObjectURL(file);
        setVideo({
          public_id: uploaded.public_id,
          url: localVideo.current,
          poster: "",
          duration: Math.round(uploaded.duration ?? seconds ?? 0),
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Video didn't upload.",
        );
      } finally {
        setVideoUpload(null);
      }
    },
    [listing],
  );

  const removeVideo = () => {
    dropLocalVideo();
    setVideo(null);
  };

  return {
    photos,
    setPhotos,
    pending,
    addPhotos,
    removePhoto,
    video,
    setVideo,
    videoUpload,
    addVideo,
    removeVideo,
    busy: pending.length > 0 || videoUpload !== null,
  };
};

export type ListingMedia = ReturnType<typeof useListingMedia>;

export default useListingMedia;
