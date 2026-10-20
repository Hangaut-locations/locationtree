import { useEffect, useRef, useState } from "react";

interface QrHit {
  rawValue?: string;
}

interface QrDetector {
  detect: (source: CanvasImageSource) => Promise<QrHit[]>;
}

const detectorFor = () => {
  const BarcodeDetector = (
    window as unknown as {
      BarcodeDetector?: new (options: { formats: string[] }) => QrDetector;
    }
  ).BarcodeDetector;
  return BarcodeDetector ? new BarcodeDetector({ formats: ["qr_code"] }) : null;
};

const QrScanner = ({
  onCode,
  onClose,
}: {
  onCode: (code: string) => void;
  onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    const detector = detectorFor();
    if (!video || !detector) {
      setProblem("This browser can't scan a QR. Type the code instead.");
      return;
    }

    let stopped = false;
    let timer = 0;
    let stream: MediaStream | null = null;

    const stop = () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((next) => {
        if (stopped) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = next;
        video.srcObject = next;
        return video.play();
      })
      .then(() => {
        const tick = () => {
          if (stopped) return;
          detector
            .detect(video)
            .then((found) => {
              const value = found[0]?.rawValue?.trim().toUpperCase();
              if (value) {
                stop();
                onCode(value);
                return;
              }
              timer = window.setTimeout(tick, 300);
            })
            .catch(() => {
              timer = window.setTimeout(tick, 300);
            });
        };
        tick();
      })
      .catch(() => {
        if (!stopped) {
          setProblem("Couldn't open the camera. Type the code instead.");
        }
      });

    return stop;
  }, [onCode]);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <p className="text-sm font-semibold">Point the camera at their QR</p>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold text-muted-foreground"
        >
          Close
        </button>
      </div>
      {problem ? (
        <p className="px-3 pb-3 text-sm text-muted-foreground">{problem}</p>
      ) : (
        <video
          ref={videoRef}
          muted
          playsInline
          className="aspect-square w-full bg-black object-cover"
        />
      )}
    </div>
  );
};

export default QrScanner;
