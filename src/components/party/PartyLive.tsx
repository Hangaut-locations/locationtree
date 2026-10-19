import { Camera, Heart, SwitchCamera, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import {
  fetchHostFeed,
  fetchLive,
  liveViewerId,
  sendHostSignal,
  sendLiveComment,
  sendViewerSignal,
  startLive,
  stopLive,
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

const PartyLive = ({
  partyId,
  ownerId,
  linkKey,
}: {
  partyId: string;
  ownerId: string;
  linkKey?: string;
}) => {
  const { data: user } = useAuth();
  const isHost = sameId(user?._id, ownerId);
  const viewerId = useRef(liveViewerId());
  const [state, setState] = useState<LiveState | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const previewRef = useRef<HTMLVideoElement>(null);
  const watchRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const hostAfter = useRef(0);
  const viewerAfter = useRef(0);
  const viewerPc = useRef<RTCPeerConnection | null>(null);
  const viewerIce = useRef<RTCIceCandidateInit[]>([]);
  const appliedOffer = useRef("");
  const hostIce = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const closeViewer = () => {
    viewerPc.current?.close();
    viewerPc.current = null;
    appliedOffer.current = "";
    viewerIce.current = [];
    if (watchRef.current) watchRef.current.srcObject = null;
  };

  const closeHost = () => {
    for (const peer of peersRef.current.values()) peer.close();
    peersRef.current.clear();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
  };

  useEffect(
    () => () => {
      closeViewer();
      closeHost();
    },
    [],
  );

  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      try {
        const next = await fetchLive(partyId, viewerId.current, viewerAfter.current, linkKey);
        if (stopped) return;
        setState(next);
        const last = next.signals.at(-1);
        if (last) viewerAfter.current = last.seq;
        if (!isHost && next.live) {
          for (const signal of next.signals) {
            await applyViewerSignal(signal);
          }
        }
        if (!next.live) closeViewer();
      } catch {
        // the next poll tries again
      }
      if (!stopped) window.setTimeout(tick, 1500);
    };
    void tick();
    return () => {
      stopped = true;
    };
  }, [partyId, linkKey, isHost]);

  useEffect(() => {
    if (!isHost || !streamRef.current) return;
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
      if (!stopped) window.setTimeout(tick, 1500);
    };
    void tick();
    return () => {
      stopped = true;
    };
  }, [isHost, partyId, state?.live]);

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
      if (watchRef.current) watchRef.current.srcObject = event.streams[0];
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

  const openCamera = async (nextFacing: "environment" | "user") => {
    const video = { facingMode: nextFacing === "environment" ? { ideal: "environment" } : "user" };
    try {
      return await navigator.mediaDevices.getUserMedia({ video, audio: true });
    } catch {
      if (nextFacing === "user") throw new Error("camera");
      return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }
  };

  const goLive = async () => {
    setBusy(true);
    try {
      const stream = await openCamera(facing);
      streamRef.current = stream;
      if (previewRef.current) previewRef.current.srcObject = stream;
      hostAfter.current = 0;
      await startLive(partyId);
      setState((current) => (current ? { ...current, live: true } : current));
    } catch (error) {
      closeHost();
      toast.error(
        error instanceof Error && error.message === "camera"
          ? "Allow the camera to go live"
          : errorText(error, "Couldn't go live"),
      );
    } finally {
      setBusy(false);
    }
  };

  const endLive = async () => {
    setBusy(true);
    try {
      await stopLive(partyId);
      closeHost();
      setState((current) => (current ? { ...current, live: false } : current));
    } catch (error) {
      toast.error(errorText(error, "Couldn't stop the live video"));
    } finally {
      setBusy(false);
    }
  };

  const flipCamera = async () => {
    const stream = streamRef.current;
    if (!stream) return;
    const next = facing === "environment" ? "user" : "environment";
    try {
      const flipped = await openCamera(next);
      const videoTrack = flipped.getVideoTracks()[0];
      const old = stream.getVideoTracks()[0];
      if (old) {
        stream.removeTrack(old);
        old.stop();
      }
      stream.addTrack(videoTrack);
      flipped.getAudioTracks().forEach((track) => track.stop());
      for (const peer of peersRef.current.values()) {
        const sender = peer.getSenders().find((item) => item.track?.kind === "video");
        if (sender) await sender.replaceTrack(videoTrack);
      }
      setFacing(next);
      if (previewRef.current) previewRef.current.srcObject = stream;
    } catch {
      toast.error("Couldn't switch the camera");
    }
  };

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

  useEffect(() => {
    if (state?.started && window.location.hash === "#live") {
      document.getElementById("live")?.scrollIntoView();
    }
  }, [state?.started]);

  if (!state?.started || state.ended) return null;

  const comments = state.comments ?? [];

  return (
    <section id="live" className="scroll-mt-24 border-b border-border py-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Live</h2>
        {state.live && (
          <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
            Live
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Anyone on the site can watch, comment, and leave a love. No login needed.
      </p>

      {isHost && !state.live && (
        <button
          type="button"
          onClick={() => void goLive()}
          disabled={busy}
          className="mt-4 flex items-center gap-2 rounded-full bg-purple-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Camera className="h-4 w-4" />
          Go live
        </button>
      )}

      {isHost && state.live && (
        <div className="mt-4">
          <video
            ref={previewRef}
            autoPlay
            muted
            playsInline
            className={`aspect-video w-full rounded-2xl bg-black object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => void flipCamera()}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold"
            >
              <SwitchCamera className="h-4 w-4" />
              Switch camera
            </button>
            <button
              type="button"
              onClick={() => void endLive()}
              disabled={busy}
              className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-2 text-sm font-semibold text-white"
            >
              <VideoOff className="h-4 w-4" />
              Stop
            </button>
          </div>
        </div>
      )}

      {!isHost && state.live && !state.full && (
        <video ref={watchRef} autoPlay playsInline className="mt-4 aspect-video w-full rounded-2xl bg-black object-cover" />
      )}

      {!isHost && state.live && state.full && (
        <p className="mt-4 rounded-2xl bg-muted px-4 py-3 text-sm">
          Too many people are watching the video right now. You can still comment and leave a love.
        </p>
      )}

      {!state.live && !isHost && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Video className="h-4 w-4" />
          The host hasn't turned the camera on yet.
        </p>
      )}

      {state.live && (
        <div className="mt-4">
          <button type="button" onClick={() => void tapLove()} className="flex items-center gap-2 text-sm font-semibold">
            <Heart className={`h-5 w-5 ${state.loved ? "fill-red-500 text-red-500" : ""}`} />
            {state.loves} {state.loves === 1 ? "love" : "loves"}
          </button>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
            {comments.map((comment: LiveComment) => (
              <p key={comment.id} className="text-sm">
                <span className="font-semibold">{comment.name}</span>{" "}
                <span className="text-muted-foreground">{comment.text}</span>
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
              placeholder="Your name"
              className="w-28 rounded-full border border-border px-3 py-2 text-sm"
            />
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={200}
              placeholder="Say something"
              className="min-w-0 flex-1 rounded-full border border-border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default PartyLive;
