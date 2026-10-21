import { ImagePlus, SwitchCamera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MAX_VIDEO_SECONDS } from "../../lib/media";

type Facing = "user" | "environment";

const LIMIT_SECONDS = Math.min(60, MAX_VIDEO_SECONDS);

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

/** Front or back camera. A photo or a short video goes straight to the story. */
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
  const [facing, setFacing] = useState<Facing>("user");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mime = recorderType();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    keepRef.current = true;
    setReady(false);
    setError("");
    const run = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser can't open the camera. Choose a file instead.");
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
          setError("Allow the camera, or choose a photo or video from your files.");
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
      keepRef.current = false;
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecording(false);
    };
  }, [open, facing]);

  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current + 1 >= LIMIT_SECONDS) {
          recorderRef.current?.state === "recording" && recorderRef.current.stop();
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
    if (!stream || !mime) return;
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

  const flip = () => {
    if (recording || adding) return;
    setFacing((current) => (current === "user" ? "environment" : "user"));
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Camera"
    >
      <video
        ref={videoRef}
        className={`h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
        playsInline
        muted
        autoPlay
      />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <button type="button" onClick={onClose} aria-label="Close camera" className="rounded-full bg-black/50 p-2">
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold">
          {recording ? `0:${String(seconds).padStart(2, "0")}` : facing === "user" ? "Front camera" : "Back camera"}
        </p>
        <button
          type="button"
          onClick={flip}
          disabled={recording || adding || !ready}
          aria-label={facing === "user" ? "Use the back camera" : "Use the front camera"}
          className="rounded-full bg-black/50 p-2 disabled:opacity-40"
        >
          <SwitchCamera className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <p className="absolute inset-x-6 top-1/3 text-center text-sm">{error}</p>
      )}
      {adding && (
        <p className="absolute inset-x-6 top-1/3 text-center text-sm font-semibold">
          Adding to your story…
        </p>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-8 pb-8">
        <button
          type="button"
          onClick={onLibrary}
          disabled={recording || adding}
          aria-label="Choose a photo or video"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 disabled:opacity-40"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={takePhoto}
          disabled={!ready || recording || adding}
          aria-label="Take photo"
          className="h-16 w-16 rounded-full border-4 border-white bg-white/90 disabled:opacity-40"
        />
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={!ready || adding || !mime}
          aria-label={recording ? "Stop video" : "Record video"}
          className={`flex h-14 w-14 items-center justify-center rounded-full ${recording ? "bg-white" : "bg-red-600"} disabled:opacity-40`}
        >
          <span className={recording ? "h-5 w-5 rounded-sm bg-red-600" : "h-6 w-6 rounded-full bg-white"} />
        </button>
      </div>
    </div>
  );
};
