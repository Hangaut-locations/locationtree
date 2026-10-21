import { Image, SwitchCamera, X, Zap, ZapOff } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { MAX_VIDEO_SECONDS } from "../../lib/media";
import {
  allowPicturesFolder,
  browserCanRememberPictures,
  loadRecentPictures,
  type RecentShot,
} from "../../lib/storyGallery";

type Facing = "user" | "environment";

const LIMIT_SECONDS = Math.min(60, MAX_VIDEO_SECONDS);
const HOLD_MS = 280;

const recorderType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  const types = ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

const openStream = async (facing: Facing) => {
  const video = { facingMode: { ideal: facing } };
  try {
    return await navigator.mediaDevices.getUserMedia({ video, audio: true });
  } catch {
    return navigator.mediaDevices.getUserMedia({ video, audio: false });
  }
};

/** Full-screen camera. Tap the ring for a photo, hold it for a video, or open the gallery. */
export const StoryCamera = ({
  open,
  adding,
  onClose,
  onFile,
  onLibrary,
}: {
  open: boolean;
  adding: boolean;
  onClose: () => void;
  onFile: (file: File) => void;
  onLibrary: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const keepRef = useRef(true);
  const holdRef = useRef<number | null>(null);
  const heldRef = useRef(false);
  const shotRef = useRef(false);
  const [facing, setFacing] = useState<Facing>("user");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [flash, setFlash] = useState(false);
  const [shots, setShots] = useState<RecentShot[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [tray, setTray] = useState(false);
  const shotsRef = useRef<RecentShot[]>([]);
  const mime = recorderType();

  const replaceShots = (list: RecentShot[]) => {
    const keep = new Set(list.map((shot) => shot.url));
    shotsRef.current.forEach((shot) => {
      if (!keep.has(shot.url)) URL.revokeObjectURL(shot.url);
    });
    shotsRef.current = list;
    setShots(list);
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    keepRef.current = true;
    setReady(false);
    setError("");
    setFlash(false);
    const run = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser can't open the camera. Choose one from your gallery.");
        return;
      }
      try {
        const stream = await openStream(facing);
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        if (!cancelled) {
          setError("Allow the camera, or choose a photo from your gallery.");
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
      keepRef.current = false;
      if (holdRef.current) window.clearTimeout(holdRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecording(false);
    };
  }, [open, facing]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setTray(false);
    setGalleryLoading(true);
    void loadRecentPictures((list) => {
      if (cancelled) {
        list.forEach((shot) => URL.revokeObjectURL(shot.url));
        return;
      }
      replaceShots(list);
    }).finally(() => {
      if (!cancelled) setGalleryLoading(false);
    });
    return () => {
      cancelled = true;
      shotsRef.current.forEach((shot) => URL.revokeObjectURL(shot.url));
      shotsRef.current = [];
      setShots([]);
    };
  }, [open]);

  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current + 1 >= LIMIT_SECONDS) {
          if (recorderRef.current?.state === "recording") recorderRef.current.stop();
          return LIMIT_SECONDS;
        }
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  if (!open) return null;

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    if (facing === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onFile(new File([blob], "story.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream || !mime || recorderRef.current?.state === "recording") return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      if (!keepRef.current) return;
      setRecording(false);
      const type = mime.split(";")[0];
      const blob = new Blob(chunksRef.current, { type });
      if (blob.size < 1) return;
      const ext = type.includes("mp4") ? "mp4" : "webm";
      onFile(new File([blob], `story.${ext}`, { type }));
    };
    recorder.start(200);
    setRecording(true);
  };

  const openGallery = async () => {
    if (recording || adding) return;
    if (shots.length > 0) {
      setTray(true);
      return;
    }
    if (!browserCanRememberPictures()) {
      onLibrary();
      return;
    }
    const allowed = await allowPicturesFolder();
    if (!allowed) return;
    setGalleryLoading(true);
    try {
      await loadRecentPictures(replaceShots);
      setTray(true);
    } finally {
      setGalleryLoading(false);
    }
  };

  const flip = () => {
    if (recording || adding) return;
    setFacing((current) => (current === "user" ? "environment" : "user"));
  };

  const toggleFlash = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !flash;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next }],
      } as unknown as MediaTrackConstraints);
      setFlash(next);
    } catch {
      setFlash(false);
    }
  };

  const shutterDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!ready || adding || recording) return;
    shotRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    heldRef.current = false;
    holdRef.current = window.setTimeout(() => {
      heldRef.current = true;
      startRecording();
    }, HOLD_MS);
  };

  const shutterUp = () => {
    if (shotRef.current) return;
    shotRef.current = true;
    if (holdRef.current) {
      window.clearTimeout(holdRef.current);
      holdRef.current = null;
    }
    if (heldRef.current) {
      heldRef.current = false;
      stopRecording();
      return;
    }
    takePhoto();
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Add to story"
    >
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
        playsInline
        muted
        autoPlay
      />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pb-4 pt-5">
        <button type="button" onClick={onClose} aria-label="Close camera" className="p-2">
          <X className="h-7 w-7" />
        </button>
        {recording ? (
          <p className="rounded-full bg-black/40 px-3 py-1 text-sm font-semibold">
            {`0:${String(seconds).padStart(2, "0")}`}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void toggleFlash()}
            disabled={!ready || adding}
            aria-label={flash ? "Turn flash off" : "Turn flash on"}
            className="p-2 disabled:opacity-40"
          >
            {flash ? <Zap className="h-6 w-6" /> : <ZapOff className="h-6 w-6" />}
          </button>
        )}
        <span className="w-11" />
      </div>

      {error && (
        <p className="absolute inset-x-8 top-1/3 text-center text-sm">{error}</p>
      )}
      {adding && (
        <p className="absolute inset-x-8 top-1/3 text-center text-sm font-semibold">
          Adding to your story…
        </p>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-8 pb-8 pt-16">
        {!recording && (
          <p className="mb-4 text-center text-xs font-semibold tracking-wide text-white/80">
            Story
          </p>
        )}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => void openGallery()}
            disabled={recording || adding}
            aria-label="Choose from gallery"
            aria-busy={galleryLoading}
            className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white/10 disabled:opacity-40 ${galleryLoading && !shots[0] ? "animate-pulse" : ""}`}
          >
            {shots[0] ? (
              shots[0].file.type.startsWith("video/") ? (
                <video src={shots[0].url} muted className="h-full w-full object-cover" />
              ) : (
                <img src={shots[0].url} alt="" className="h-full w-full object-cover" />
              )
            ) : (
              <Image className="h-6 w-6" />
            )}
          </button>

          <button
            type="button"
            onPointerDown={shutterDown}
            onPointerUp={shutterUp}
            onPointerCancel={shutterUp}
            onClick={() => {
              if (shotRef.current || recording) return;
              takePhoto();
            }}
            disabled={!ready || adding}
            aria-label={recording ? "Stop video" : "Take photo. Hold for video"}
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white disabled:opacity-40"
          >
            <span
              className={
                recording
                  ? "h-8 w-8 rounded-md bg-red-500"
                  : "h-16 w-16 rounded-full bg-white"
              }
            />
          </button>

          <button
            type="button"
            onClick={flip}
            disabled={recording || adding || !ready}
            aria-label={facing === "user" ? "Use the back camera" : "Use the front camera"}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 disabled:opacity-40"
          >
            <SwitchCamera className="h-6 w-6" />
          </button>
        </div>
      </div>
      {tray && (
        <div className="absolute inset-0 z-20 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 pb-3 pt-5">
            <button type="button" onClick={() => setTray(false)} className="text-sm font-semibold">
              Back
            </button>
            <p className="text-sm font-semibold">Gallery</p>
            <button type="button" onClick={onLibrary} className="text-sm font-semibold">
              Phone
            </button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-0.5 overflow-y-auto">
            {shots.map((shot) => (
              <button
                key={shot.key}
                type="button"
                onClick={() => onFile(shot.file)}
                className="aspect-square overflow-hidden bg-white/10"
              >
                {shot.file.type.startsWith("video/") ? (
                  <video src={shot.url} muted className="h-full w-full object-cover" />
                ) : (
                  <img src={shot.url} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
