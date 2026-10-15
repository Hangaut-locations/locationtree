import { Film, RefreshCw, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { formatVideoLength } from "../../lib/media";
import type { ListingMedia } from "../hooks/useListingMedia";

interface ListingVideoPickerProps {
  media: ListingMedia;
  id: string;
}

const ListingVideoPicker = ({ media, id }: ListingVideoPickerProps) => {
  const { video, videoUpload, addVideo, removeVideo } = media;

  const handlePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) addVideo(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-3 border-t border-border pt-6">
      <div>
        <h3 className="text-base font-bold text-foreground">
          Add a short video{" "}
          <span className="text-xs font-semibold text-muted-foreground">
            (optional)
          </span>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Up to 1 minute. Guests can watch it while they swipe through your
          photos.
        </p>
      </div>

      <input
        id={id}
        type="file"
        accept="video/*"
        onChange={handlePick}
        className="hidden"
      />

      {videoUpload ? (
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/40">
              <Film className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {videoUpload.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Uploading {Math.round(videoUpload.progress * 100)}%
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-600 via-purple-500 to-fuchsia-500 transition-[width] duration-300"
              style={{ width: `${Math.round(videoUpload.progress * 100)}%` }}
            />
          </div>
        </div>
      ) : video ? (
        <div className="group relative overflow-hidden rounded-3xl border border-border bg-black shadow-sm">
          <video
            key={video.url}
            src={video.url}
            poster={video.poster || undefined}
            controls
            muted
            playsInline
            preload="metadata"
            className="aspect-video w-full object-contain"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
            Video · {formatVideoLength(video.duration)}
          </span>
          <div className="absolute right-3 top-3 flex gap-2">
            <label
              htmlFor={id}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-purple-700"
              aria-label="Replace video"
              title="Replace video"
            >
              <RefreshCw className="h-4 w-4" />
            </label>
            <button
              type="button"
              onClick={removeVideo}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
              aria-label="Remove video"
              title="Remove video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex w-full cursor-pointer items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-card px-5 py-5 transition-all hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/40">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Upload a video</p>
            <p className="text-xs text-muted-foreground">
              MP4 or MOV, 1 minute max, under 100MB
            </p>
          </div>
        </label>
      )}
    </div>
  );
};

export default ListingVideoPicker;
