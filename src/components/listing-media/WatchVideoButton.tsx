import { Play } from "lucide-react";
import { formatVideoLength } from "../../lib/media";
import type { ListingVideo } from "../../types/listing";

interface WatchVideoButtonProps {
  video: ListingVideo;
  onClick: () => void;
}

/** Sits on the cover photo of a listing that has a video. */
const WatchVideoButton = ({ video, onClick }: WatchVideoButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/95 py-2 pl-2 pr-4 text-sm font-semibold text-foreground shadow-lg transition-transform hover:scale-[1.03] active:scale-97 cursor-pointer dark:bg-neutral-900/95"
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 via-purple-600 to-violet-700 text-white">
      <Play className="h-3.5 w-3.5 fill-white" />
    </span>
    Watch video
    <span className="text-xs font-medium text-muted-foreground">
      {formatVideoLength(video.duration)}
    </span>
  </button>
);

export default WatchVideoButton;
