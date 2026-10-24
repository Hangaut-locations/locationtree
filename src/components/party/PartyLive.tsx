import { Camera, Heart, Share2, SwitchCamera, Video, VideoOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ShareModal from "../ShareModal";
import { listingPath } from "../../lib/privateLink";
import {
  fetchHostFeed,
  fetchLive,
  liveViewerId,
  sendHostSignal,
  sendLiveComment,
  sendViewerSignal,
  startLive,
  stopLive,
  stopLiveNow,
  toggleLiveLove,
  type LiveComment,
  type LiveSignal,
  type LiveState,
} from "../../lib/live";

const iceServers: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: [
      "turn:global.relay.metered.ca:80",
      "turn:global.relay.metered.ca:80?transport=tcp",
      "turn:global.relay.metered.ca:443",
      "turns:global.relay.metered.ca:443?transport=tcp",
    ],
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

const sameId = (left?: string, right?: string) => !!left && !!right && String(left) === String(right);

const errorText = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return typeof message === "string" ? message : fallback;
};

type Facing = "environment" | "user";

const otherFacing = (facing: Facing): Facing => (facing === "environment" ? "user" : "environment");

const labelFacing = (label: string): Facing | "" => {
  const text = label.toLowerCase();
  if (text.includes("back") || text.includes("rear") || text.includes("environment")) return "environment";
  if (text.includes("front") || text.includes("user") || text.includes("face")) return "user";
  return "";
};

const seenFacing = (stream: MediaStream, fallback: Facing): Facing => {
  const seen = stream.getVideoTracks()[0]?.getSettings().facingMode;
  if (seen === "user" || seen === "environment") return seen;
  return fallback;
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

// Phones ignore a soft facing hint and will not open the other camera while the first is still on.
const openVideo = async (facing: Facing, avoidId?: string) => {
  const tries: MediaStreamConstraints[] = [{ video: { facingMode: { exact: facing } }, audio: false }];
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput" && device.deviceId);
    const labeled = cameras.find((device) => labelFacing(device.label) === facing);
    const other = cameras.find((device) => device.deviceId !== avoidId);
    const chosen = labeled?.deviceId || (avoidId ? other?.deviceId : undefined);
    if (chosen) tries.push({ video: { deviceId: { exact: chosen } }, audio: false });
  } catch {
    // the exact facing request still runs
  }
  tries.push({ video: { facingMode: facing }, audio: false });
  let last: unknown;
  for (const constraints of tries) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      last = error;
    }
  }
  throw last instanceof Error ? last : new Error("camera");
};

const openLiveCamera = async (facing: Facing) => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: facing } },
      audio: true,
    });
  } catch {
    // try the camera list below
  }
  const videoOnly = await openVideo(facing);
  try {
    const audio = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return new MediaStream([...audio.getAudioTracks(), ...videoOnly.getVideoTracks()]);
  } catch {
    return videoOnly;
  }
};

const PartyLive = ({
  partyId,
  ownerId,
  linkKey,
  screen = false,
  title = "",
  onClose,
}: {
  partyId: string;
  ownerId: string;
  linkKey?: string;
  screen?: boolean;
  title?: string;
  onClose?: () => void;
}) => {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const isHost = sameId(user?._id, ownerId);
  const viewerId = useRef(liveViewerId());
  const [state, setState] = useState<LiveState | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<Facing>("environment");
  const [cameraOn, setCameraOn] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [pictureOn, setPictureOn] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const watchRef = useRef<HTMLVideoElement>(null);
  const watchStream = useRef<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const hostAfter = useRef(0);
  const viewerAfter = useRef(0);
  const viewerPc = useRef<RTCPeerConnection | null>(null);
  const viewerIce = useRef<RTCIceCandidateInit[]>([]);
  const appliedOffer = useRef("");
  const hostIce = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const opening = useRef<Promise<MediaStream> | null>(null);
  const flipping = useRef(false);
  const mounted = useRef(true);
  const liveOn = useRef(false);
  const ending = useRef(false);

  const attachPreview = (stream: MediaStream) => {
    const video = previewRef.current;
    if (!video) return;
    if (video.srcObject !== stream) video.srcObject = stream;
    void video.play().catch(() => undefined);
  };

  const bindPreview = (node: HTMLVideoElement | null) => {
    previewRef.current = node;
    if (node && streamRef.current) attachPreview(streamRef.current);
  };

  const bindWatch = (node: HTMLVideoElement | null) => {
    watchRef.current = node;
    if (!node || !watchStream.current) return;
    node.srcObject = watchStream.current;
    void node.play().catch(() => undefined);
  };

  const closeViewer = () => {
    viewerPc.current?.close();
    viewerPc.current = null;
    appliedOffer.current = "";
    viewerIce.current = [];
    watchStream.current = null;
    if (mounted.current) setPictureOn(false);
    if (watchRef.current) watchRef.current.srcObject = null;
  };

  const closeHost = () => {
    for (const peer of peersRef.current.values()) peer.close();
    peersRef.current.clear();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (liveOn.current) stopLiveNow(partyId);
      closeViewer();
      closeHost();
    };
  }, [partyId]);

  useEffect(() => {
    if (!isHost) return;
    let timer = 0;
    const onHide = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === "hidden") timer = window.setTimeout(leaveLive, 8000);
    };
    window.addEventListener("pagehide", leaveLive);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", leaveLive);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [isHost, partyId]);

  useEffect(() => {
    let stopped = false;
    let nextLive = false;
    const tick = async () => {
      if (stopped) return;
      try {
        const next = await fetchLive(partyId, viewerId.current, viewerAfter.current, linkKey);
        if (stopped) return;
        nextLive = next.live;
        setState(next);
        const last = next.signals.at(-1);
        if (last) viewerAfter.current = last.seq;
        if (!isHost && next.live) {
          for (const signal of next.signals) {
            await applyViewerSignal(signal);
          }
        }
        if (!next.live) {
          closeViewer();
          if (isHost && liveOn.current) {
            liveOn.current = false;
            closeHost();
            setCameraOn(false);
          }
        }
      } catch {
        // the next poll tries again
      }
      if (!stopped) window.setTimeout(tick, nextLive ? 600 : 1500);
    };
    void tick();
    return () => {
      stopped = true;
    };
  }, [partyId, linkKey, isHost]);

  useEffect(() => {
    if (!isHost || !cameraOn || !state?.live) return;
    let stopped = false;
    const tick = async () => {
      if (stopped || !streamRef.current) return;
      try {
        const feed = await fetchHostFeed(partyId, hostAfter.current);
        if (stopped) return;
        const last = feed.signals.at(-1);
        if (last) hostAfter.current = last.seq;
        const still = new Set(feed.viewers);
        for (const [id, peer] of peersRef.current) {
          if (!still.has(id)) {
            peer.close();
            peersRef.current.delete(id);
          }
        }
        for (const id of feed.viewers) {
          if (!peersRef.current.has(id)) void offerTo(id);
        }
        for (const signal of feed.signals) applyHostSignal(signal);
      } catch {
        // keep polling
      }
      if (!stopped) window.setTimeout(tick, 600);
    };
    void tick();
    return () => {
      stopped = true;
    };
  }, [isHost, partyId, cameraOn, state?.live]);

  const offerTo = async (id: string) => {
    const stream = streamRef.current;
    if (!stream || peersRef.current.has(id)) return;
    const peer = new RTCPeerConnection({ iceServers });
    peersRef.current.set(id, peer);
    for (const track of stream.getTracks()) peer.addTrack(track, stream);
    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      void sendHostSignal(partyId, id, "ice", JSON.stringify(event.candidate));
    };
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await sendHostSignal(partyId, id, "offer", JSON.stringify(offer));
  };

  const applyHostSignal = (signal: LiveSignal) => {
    const peer = peersRef.current.get(signal.viewerId);
    if (!peer) return;
    if (signal.kind === "answer") {
      if (peer.signalingState !== "have-local-offer") return;
      void peer.setRemoteDescription(JSON.parse(signal.payload) as RTCSessionDescriptionInit).then(async () => {
        const queued = hostIce.current.get(signal.viewerId) ?? [];
        for (const candidate of queued) {
          await peer.addIceCandidate(candidate).catch(() => undefined);
        }
        hostIce.current.delete(signal.viewerId);
      });
      return;
    }
    if (signal.kind === "ice") {
      const candidate = JSON.parse(signal.payload) as RTCIceCandidateInit;
      if (!peer.remoteDescription) {
        const queued = hostIce.current.get(signal.viewerId) ?? [];
        queued.push(candidate);
        hostIce.current.set(signal.viewerId, queued);
        return;
      }
      void peer.addIceCandidate(candidate).catch(() => undefined);
    }
  };

  const applyViewerSignal = async (signal: LiveSignal) => {
    if (signal.kind === "ice") {
      const candidate = JSON.parse(signal.payload) as RTCIceCandidateInit;
      if (!viewerPc.current?.remoteDescription) {
        viewerIce.current.push(candidate);
        return;
      }
      await viewerPc.current.addIceCandidate(candidate).catch(() => undefined);
      return;
    }
    if (signal.kind !== "offer" || signal.payload === appliedOffer.current) return;
    appliedOffer.current = signal.payload;
    viewerPc.current?.close();
    const peer = new RTCPeerConnection({ iceServers });
    viewerPc.current = peer;
    peer.ontrack = (event) => {
      watchStream.current = event.streams[0];
      setPictureOn(true);
      if (watchRef.current) {
        watchRef.current.srcObject = event.streams[0];
        void watchRef.current.play().catch(() => undefined);
      }
    };
    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      void sendViewerSignal(partyId, viewerId.current, "ice", JSON.stringify(event.candidate), linkKey);
    };
    await peer.setRemoteDescription(JSON.parse(signal.payload) as RTCSessionDescriptionInit);
    for (const candidate of viewerIce.current) {
      await peer.addIceCandidate(candidate).catch(() => undefined);
    }
    viewerIce.current = [];
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await sendViewerSignal(partyId, viewerId.current, "answer", JSON.stringify(answer), linkKey);
  };

  const ensureCamera = (wanted: Facing) => {
    const current = streamRef.current;
    if (current?.getVideoTracks().some((track) => track.readyState === "live")) {
      return Promise.resolve(current);
    }
    if (opening.current) return opening.current;
    const pending = openLiveCamera(wanted)
      .then((stream) => {
        if (!mounted.current) {
          stream.getTracks().forEach((track) => track.stop());
          throw new Error("closed");
        }
        streamRef.current = stream;
        setFacing(seenFacing(stream, wanted));
        setCameraOn(true);
        setCameraError("");
        attachPreview(stream);
        stream.getVideoTracks().forEach((track) => {
          track.onended = () => {
            if (flipping.current || ending.current) return;
            leaveLive();
          };
        });
        return stream;
      })
      .finally(() => {
        if (opening.current === pending) opening.current = null;
      });
    opening.current = pending;
    return pending;
  };

  const goLive = async () => {
    setBusy(true);
    setCameraError("");
    try {
      await ensureCamera(facing);
      hostAfter.current = 0;
      await startLive(partyId);
      liveOn.current = true;
      ending.current = false;
      setState((current) => (current ? { ...current, live: true } : current));
    } catch (error) {
      if (!streamRef.current) closeHost();
      const message =
        error instanceof Error && (error.message === "camera" || error.name === "NotAllowedError")
          ? "Allow the camera to go live"
          : errorText(error, "Couldn't go live");
      setCameraError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const leaveLive = () => {
    if (!liveOn.current || ending.current) return;
    ending.current = true;
    liveOn.current = false;
    stopLiveNow(partyId);
    closeHost();
    if (mounted.current) {
      setCameraOn(false);
      setState((current) => (current ? { ...current, live: false } : current));
    }
  };

  const endLive = async () => {
    if (ending.current) return;
    ending.current = true;
    liveOn.current = false;
    setBusy(true);
    try {
      await stopLive(partyId);
      closeHost();
      setCameraOn(false);
      setState((current) => (current ? { ...current, live: false } : current));
    } catch (error) {
      ending.current = false;
      liveOn.current = true;
      toast.error(errorText(error, "Couldn't stop the live video"));
    } finally {
      setBusy(false);
    }
  };

  const flipCamera = async () => {
    if (flipping.current) return;
    flipping.current = true;
    const next = otherFacing(facing);
    const current = streamRef.current;
    const audio = (current?.getAudioTracks() ?? []).filter((track) => track.readyState === "live");
    const previousId = current?.getVideoTracks()[0]?.getSettings().deviceId;
    current?.getVideoTracks().forEach((track) => {
      track.stop();
      current.removeTrack(track);
    });
    await wait(200);
    try {
      let opened = await openVideo(next, previousId);
      let videoTrack = opened.getVideoTracks()[0];
      const openedId = videoTrack?.getSettings().deviceId;
      const seen = videoTrack?.getSettings().facingMode;
      const sameDevice = !!previousId && openedId === previousId;
      const wrongFace = (seen === "user" || seen === "environment") && seen !== next;
      if (!videoTrack || sameDevice || wrongFace) {
        videoTrack?.stop();
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(
          (device) => device.kind === "videoinput" && device.deviceId && device.deviceId !== previousId,
        );
        const labeled = cameras.find((device) => labelFacing(device.label) === next) ?? cameras[0];
        if (!labeled) throw new Error("camera");
        opened = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: labeled.deviceId } },
          audio: false,
        });
        videoTrack = opened.getVideoTracks()[0];
      }
      if (!videoTrack) throw new Error("camera");
      videoTrack.onended = () => {
        if (flipping.current || ending.current) return;
        leaveLive();
      };
      opened.getAudioTracks().forEach((track) => track.stop());
      const mixed = new MediaStream([...audio, videoTrack]);
      streamRef.current = mixed;
      const reported = videoTrack.getSettings().facingMode;
      setFacing(reported === "user" || reported === "environment" ? reported : next);
      setCameraOn(true);
      attachPreview(mixed);
      await Promise.all(
        [...peersRef.current.values()].map(async (peer) => {
          const sender = peer.getSenders().find((item) => item.track?.kind === "video");
          if (sender) await sender.replaceTrack(videoTrack);
        }),
      );
    } catch {
      toast.error("Couldn't switch the camera");
      if (!streamRef.current?.getVideoTracks().some((track) => track.readyState === "live")) {
        try {
          const restored = await openVideo(facing, undefined);
          const videoTrack = restored.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.onended = () => {
              if (flipping.current || ending.current) return;
              leaveLive();
            };
            const mixed = new MediaStream([...audio, videoTrack]);
            streamRef.current = mixed;
            setCameraOn(true);
            attachPreview(mixed);
          }
        } catch {
          setCameraError("Couldn't switch the camera");
        }
      }
    } finally {
      flipping.current = false;
    }
  };

  useEffect(() => {
    if ((!screen && !expanded) || !isHost || cameraOn) return;
    let cancelled = false;
    void ensureCamera("environment").catch(() => {
      if (!cancelled && mounted.current) {
        setCameraError("Allow the camera to go live");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [screen, expanded, isHost, cameraOn]);

  const postComment = async () => {
    const trimmed = text.trim();
    if (!trimmed || !state?.live) return;
    setBusy(true);
    try {
      const saved = await sendLiveComment(partyId, viewerId.current, trimmed, name.trim(), linkKey);
      setState((current) =>
        current ? { ...current, comments: [...current.comments, saved] } : current,
      );
      setText("");
    } catch (error) {
      toast.error(errorText(error, "Couldn't send that"));
    } finally {
      setBusy(false);
    }
  };

  const tapLove = async () => {
    if (!state?.live) return;
    try {
      const result = await toggleLiveLove(partyId, viewerId.current, linkKey);
      setState((current) => (current ? { ...current, loves: result.loves, loved: result.loved } : current));
    } catch (error) {
      toast.error(errorText(error, "Couldn't leave a love"));
    }
  };

  const full = screen || expanded;
  const closeFull = () => {
    if (expanded) setExpanded(false);
    else onClose?.();
  };

  const openListing = () => {
    const path = listingPath("party", partyId);
    if (window.location.pathname !== path) {
      onClose?.();
      navigate(linkKey ? `${path}?key=${encodeURIComponent(linkKey)}` : path);
      return;
    }
    closeFull();
    window.setTimeout(() => {
      const details = document.getElementById("listing-details") ?? document.querySelector("main h1");
      if (!details) return;
      const bar = document.querySelector("header")?.parentElement;
      const offset = (bar?.getBoundingClientRect().height ?? 96) + 12;
      const top = details.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    if (full || !state?.started || window.location.hash !== "#live") return;
    document.getElementById("live")?.scrollIntoView();
  }, [full, state?.started]);

  useEffect(() => {
    if (!full) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFull();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [full, expanded, onClose]);

  if (!full && (!state?.started || state.ended)) return null;

  const comments = state?.comments ?? [];
  const over = !!state && (!state.started || state.ended);
  const previewClass = full
    ? `absolute inset-0 h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`
    : `aspect-video w-full rounded-2xl bg-black object-cover ${facing === "user" ? "-scale-x-100" : ""}`;
  const watchClass = full
    ? "absolute inset-0 h-full w-full object-cover"
    : "mt-4 aspect-video w-full rounded-2xl bg-black object-cover";

  return (
    <section
      id={full ? undefined : "live"}
      className={
        full
          ? "fixed inset-0 z-[90] bg-black text-white"
          : "scroll-mt-24 border-b border-border py-7"
      }
    >
      {full && (
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-10 pt-4">
          <button
            type="button"
            onClick={closeFull}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={openListing}
              className="block w-full cursor-pointer truncate text-left text-sm font-semibold underline-offset-4 hover:underline"
              aria-label={`Open ${title || "party"} listing`}
            >
              {title || "Live"}
            </button>
            {state?.live && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Live</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/50 px-3 py-2 text-sm font-semibold"
            aria-label="Share live"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          {isHost && (cameraOn || state?.live) && !over && (
            <button
              type="button"
              onClick={() => void flipCamera()}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/50 px-3 py-2 text-sm font-semibold"
            >
              <SwitchCamera className="h-4 w-4" />
              Switch camera
            </button>
          )}
          {isHost && state?.live && (
            <button
              type="button"
              onClick={() => void endLive()}
              disabled={busy}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white"
            >
              <VideoOff className="h-4 w-4" />
              Stop
            </button>
          )}
        </div>
      )}

      {!full && (
        <>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Live</h2>
            {state?.live && (
              <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                Live
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Anyone on the site can watch, comment, and leave a love. No login needed.
          </p>
        </>
      )}

      {full && !cameraOn && !over && (isHost || !state) && (
        <p className="absolute inset-x-0 top-1/2 z-10 px-6 text-center text-sm">
          {isHost ? cameraError || "Opening the camera..." : "Joining the live video..."}
        </p>
      )}
      {full && over && (
        <p className="absolute inset-x-0 top-1/2 px-6 text-center text-sm">This live video has ended.</p>
      )}

      {isHost && state && !state.live && !over && (
        <button
          type="button"
          onClick={() => void goLive()}
          disabled={busy}
          className={
            full
              ? "absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-purple-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              : "mt-4 flex items-center gap-2 rounded-full bg-purple-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          }
        >
          <Camera className="h-4 w-4" />
          Go live
        </button>
      )}

      {isHost && (cameraOn || state?.live) && !over && (
        <div className={full ? "absolute inset-0" : "mt-4"}>
          <div className={full ? "absolute inset-0" : "relative"}>
            <video
              ref={bindPreview}
              autoPlay
              muted
              playsInline
              className={previewClass}
            />
            {!full && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="absolute inset-0 rounded-2xl"
                aria-label="Open live full screen"
              />
            )}
          </div>
          {!full && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void flipCamera()}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold"
              >
                <SwitchCamera className="h-4 w-4" />
                Switch camera
              </button>
              {state?.live && (
                <button
                  type="button"
                  onClick={() => void endLive()}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  <VideoOff className="h-4 w-4" />
                  Stop
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!isHost && state?.live && !state.full && (
        <>
          <video ref={bindWatch} autoPlay playsInline className={watchClass} />
          {full && !pictureOn && (
            <p className="absolute inset-x-0 top-1/2 z-10 px-6 text-center text-sm">Connecting to the camera...</p>
          )}
        </>
      )}

      {!isHost && state?.live && state.full && (
        <p className={full ? "absolute inset-x-4 bottom-36 z-10 rounded-2xl bg-white/10 px-4 py-3 text-sm" : "mt-4 rounded-2xl bg-muted px-4 py-3 text-sm"}>
          Too many people are watching the video right now. You can still comment and leave a love.
        </p>
      )}

      {state && !state.live && !isHost && !over && (
        <p className={full ? "absolute inset-x-0 top-1/2 flex items-center justify-center gap-2 px-6 text-sm" : "mt-4 flex items-center gap-2 text-sm text-muted-foreground"}>
          <Video className="h-4 w-4" />
          The host hasn't turned the camera on yet.
        </p>
      )}

      {state?.live && (
        <div className={full ? "absolute inset-x-0 bottom-0 z-10 flex max-h-[75%] flex-col bg-gradient-to-t from-black via-black/90 to-transparent px-4 pb-4 pt-10" : "mt-4"}>
          <button type="button" onClick={() => void tapLove()} className="flex items-center gap-2 text-sm font-semibold">
            <Heart className={`h-5 w-5 ${state.loved ? "fill-red-500 text-red-500" : ""}`} />
            {state.loves} {state.loves === 1 ? "love" : "loves"}
          </button>
          <div className={full ? "mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto" : "mt-3 max-h-56 space-y-2 overflow-y-auto"}>
            {comments.map((comment: LiveComment) => (
              <p key={comment.id} className="text-sm">
                <span className="font-semibold">{comment.name}</span>{" "}
                <span className={full ? "text-white/80" : "text-muted-foreground"}>{comment.text}</span>
              </p>
            ))}
          </div>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void postComment();
            }}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              placeholder="Your location"
              className={`w-36 rounded-full border px-3 py-2 text-sm ${full ? "border-white/30 bg-white/10 placeholder:text-white/50" : "border-border"}`}
            />
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={200}
              placeholder="Say something"
              className={`min-w-0 flex-1 rounded-full border px-3 py-2 text-sm ${full ? "border-white/30 bg-white/10 placeholder:text-white/50" : "border-border"}`}
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${full ? "bg-white text-black" : "bg-foreground text-background"}`}
            >
              Send
            </button>
          </form>
        </div>
      )}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        kind="live"
        title={title || "Live"}
        details="Live"
        url={`${window.location.origin}${listingPath("party", partyId)}${
          linkKey ? `?key=${encodeURIComponent(linkKey)}` : ""
        }#live`}
      />
    </section>
  );
};

export default PartyLive;
