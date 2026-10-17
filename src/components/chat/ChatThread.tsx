import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Download,
  ImagePlus,
  MapPin,
  MoreHorizontal,
  Send,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  blockPerson,
  chatName,
  type ChatDetails,
  type ChatMessage,
  deleteMessage,
  editMessage,
  getMessages,
  markChatRead,
  moveLiveLocation,
  reportPerson,
  sendMessage,
  stopLiveLocation,
  unblockPerson,
  uploadChatPhoto,
} from "../../lib/chat";
import { getErrorMessage, type ApiError } from "../../lib/errors";

const SENT_GRADIENT =
  "linear-gradient(180deg, #f560c8 0%, #c13584 32%, #833ab4 64%, #405de6 100%)";

const whenLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** One gradient across the whole chat, so each bubble takes the colour where it sits. */
const paintBubbles = (scroller: HTMLElement) => {
  const box = scroller.getBoundingClientRect();
  scroller.querySelectorAll<HTMLElement>("[data-sent]").forEach((bubble) => {
    const top = bubble.getBoundingClientRect().top - box.top;
    bubble.style.backgroundImage = SENT_GRADIENT;
    bubble.style.backgroundRepeat = "no-repeat";
    bubble.style.backgroundSize = `100% ${box.height}px`;
    bubble.style.backgroundPosition = `0px ${-top}px`;
  });
};

const EDIT_MS = 60 * 60 * 1000;

const canStillEdit = (message: ChatMessage) =>
  message.mine &&
  message.kind === "text" &&
  Date.now() - new Date(message.createdAt).getTime() < EDIT_MS;

const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[]) => {
  const byId = new Map(current.map((message) => [message._id, message]));
  incoming.forEach((message) => {
    if (message.deleted) byId.delete(message._id);
    else byId.set(message._id, message);
  });
  return [...byId.values()].sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : 1,
  );
};

const REPORTS = [
  ["spam", "Spam"],
  ["scam", "Scam"],
  ["harassment", "Harassment"],
  ["inappropriate", "Inappropriate"],
  ["other", "Something else"],
] as const;

const ChatThread = ({ conversationId }: { conversationId: string }) => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const since = useRef("");
  const liveWatch = useRef<number | null>(null);
  const [chat, setChat] = useState<ChatDetails | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [menu, setMenu] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REPORTS)[number][0]>("spam");
  const [details, setDetails] = useState("");
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const cameraVideo = useRef<HTMLVideoElement>(null);
  const cameraStream = useRef<MediaStream | null>(null);

  const refreshUnread = () =>
    qc.invalidateQueries({ queryKey: ["chat-unread"] });

  useEffect(() => {
    let stop = false;
    since.current = "";
    setMessages([]);
    setChat(null);

    const load = async () => {
      try {
        const page = await getMessages(
          conversationId,
          since.current ? { since: since.current } : undefined,
        );
        if (stop) return;
        setChat(page.conversation);
        setHasMore((old) => (since.current ? old : page.hasMore));
        setMessages((old) =>
          since.current ? mergeMessages(old, page.messages) : page.messages,
        );
        if (!since.current || page.messages.some((message) => !message.mine)) {
          markChatRead(conversationId).then(refreshUnread).catch(() => undefined);
        }
        since.current = page.now;
      } catch (err) {
        if (!stop && !since.current) {
          toast.error(getErrorMessage(err as ApiError, "Couldn't open this chat"));
          navigate("/messages");
        }
      }
    };

    load();
    const timer = setInterval(load, 4000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [conversationId, navigate]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const paint = () => paintBubbles(node);
    paint();
    node.addEventListener("scroll", paint, { passive: true });
    window.addEventListener("resize", paint);
    return () => {
      node.removeEventListener("scroll", paint);
      window.removeEventListener("resize", paint);
    };
  }, [messages, chat]);

  useEffect(() => {
    const node = scroller.current;
    if (node && stickToBottom.current) node.scrollTop = node.scrollHeight;
  }, [messages]);

  useEffect(
    () => () => {
      if (liveWatch.current !== null) navigator.geolocation.clearWatch(liveWatch.current);
      cameraStream.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  useEffect(() => {
    const video = cameraVideo.current;
    const stream = cameraStream.current;
    if (!cameraOpen || !video || !stream) return;
    video.srcObject = stream;
    return () => {
      video.srcObject = null;
    };
  }, [cameraOpen]);

  useEffect(() => {
    if (!openPhoto) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenPhoto(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPhoto]);

  const downloadPhoto = async (url: string) => {
    const fileName = "hangaut-photo.jpg";
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("no");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.click();
    }
  };

  const onScroll = () => {
    const node = scroller.current;
    if (!node) return;
    stickToBottom.current =
      node.scrollHeight - node.scrollTop - node.clientHeight < 80;
  };

  const loadOlder = async () => {
    const first = messages[0];
    if (!first) return;
    const node = scroller.current;
    const beforeHeight = node?.scrollHeight ?? 0;
    const page = await getMessages(conversationId, { before: first._id });
    setHasMore(page.hasMore);
    setMessages((old) => mergeMessages(page.messages, old));
    requestAnimationFrame(() => {
      if (node) node.scrollTop = node.scrollHeight - beforeHeight;
    });
  };

  const addMine = (message: ChatMessage) => {
    stickToBottom.current = true;
    setMessages((old) => mergeMessages(old, [message]));
    refreshUnread();
  };

  const sendText = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      addMine(await sendMessage(conversationId, { text: body }));
      setText("");
    } catch (err) {
      toast.error(getErrorMessage(err as ApiError, "Couldn't send that"));
    } finally {
      setSending(false);
    }
  };

  const sendPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pick a photo");
      return;
    }
    setSending(true);
    try {
      const photo = await uploadChatPhoto(file);
      addMine(await sendMessage(conversationId, { photo }));
    } catch (err) {
      toast.error(getErrorMessage(err as ApiError, "Couldn't send that photo"));
    } finally {
      setSending(false);
    }
  };

  const saveEdit = async (id: string) => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const message = await editMessage(id, body);
      setMessages((old) => mergeMessages(old, [message]));
      setEditingId(null);
    } catch (err) {
      toast.error(getErrorMessage(err as ApiError, "Couldn't edit that"));
    } finally {
      setSending(false);
    }
  };

  const removeMessage = async (id: string) => {
    if (sending) return;
    setSending(true);
    try {
      await deleteMessage(id);
      setMessages((old) => old.filter((message) => message._id !== id));
      setPendingDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err as ApiError, "Couldn't delete that"));
    } finally {
      setSending(false);
    }
  };

  const stopCamera = () => {
    cameraStream.current?.getTracks().forEach((track) => track.stop());
    cameraStream.current = null;
    setCameraOpen(false);
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("This phone can't use the camera");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      cameraStream.current = stream;
      setCameraOpen(true);
    } catch {
      toast.error("Allow the camera to take a photo");
    }
  };

  const snapPhoto = () => {
    const video = cameraVideo.current;
    if (!video || !video.videoWidth) {
      toast.error("Camera isn't ready yet");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopCamera();
        sendPhoto(new File([blob], "snap.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  };

  const shareLocation = (liveMinutes?: 15 | 60 | 480) => {
    if (!navigator.geolocation) {
      toast.error("This phone can't share location");
      return;
    }
    setSending(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const message = await sendMessage(conversationId, {
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              ...(liveMinutes ? { live_minutes: liveMinutes } : {}),
            },
          });
          addMine(message);
          if (liveMinutes) followLive(message._id);
        } catch (err) {
          toast.error(getErrorMessage(err as ApiError, "Couldn't share location"));
        } finally {
          setSending(false);
        }
      },
      () => {
        setSending(false);
        toast.error("Allow location to share where you are");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const followLive = (messageId: string) => {
    if (liveWatch.current !== null) navigator.geolocation.clearWatch(liveWatch.current);
    let last = 0;
    liveWatch.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - last < 8000) return;
        last = now;
        moveLiveLocation(messageId, position.coords.latitude, position.coords.longitude)
          .then((message) => {
            setMessages((old) => mergeMessages(old, [message]));
            if (!message.location?.live && liveWatch.current !== null) {
              navigator.geolocation.clearWatch(liveWatch.current);
              liveWatch.current = null;
            }
          })
          .catch(() => undefined);
      },
      () => undefined,
      { enableHighAccuracy: true },
    );
  };

  const endLive = async (messageId: string) => {
    if (liveWatch.current !== null) {
      navigator.geolocation.clearWatch(liveWatch.current);
      liveWatch.current = null;
    }
    try {
      const message = await stopLiveLocation(messageId);
      setMessages((old) => mergeMessages(old, [message]));
    } catch (err) {
      toast.error(getErrorMessage(err as ApiError, "Couldn't stop sharing"));
    }
  };

  const name = chatName(chat?.person ?? null);
  const listingPath = chat?.listing
    ? chat.listing.type === "party"
      ? `/parties/${chat.listing.id}`
      : `/homes/${chat.listing.id}`
    : "";

  return (
    <div className="mx-auto flex h-[calc(100dvh-4.5rem)] max-w-lg flex-col">
      <header className="flex items-center gap-3 border-b border-border px-3 py-3">
        <button
          type="button"
          onClick={() => navigate("/messages")}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-800">
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{name}</p>
          {chat?.listing && (
            <Link to={listingPath} className="block truncate text-xs text-muted-foreground hover:underline">
              {chat.listing.title}
            </Link>
          )}
        </div>
        <button
          type="button"
          aria-label="Chat options"
          onClick={() => setMenu((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      {menu && chat?.person && (
        <div className="flex justify-end gap-2 border-b border-border px-4 py-2 text-xs font-semibold">
          <button
            type="button"
            onClick={async () => {
              try {
                if (chat.blockedByMe) await unblockPerson(chat.person!._id);
                else await blockPerson(chat.person!._id);
                const page = await getMessages(conversationId);
                setChat(page.conversation);
                setMenu(false);
              } catch (err) {
                toast.error(getErrorMessage(err as ApiError, "Couldn't update the block"));
              }
            }}
            className="rounded-full border border-border px-3 py-1.5"
          >
            {chat.blockedByMe ? "Unblock" : "Block"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              setReportOpen(true);
            }}
            className="rounded-full border border-border px-3 py-1.5 text-red-600"
          >
            Report
          </button>
        </div>
      )}

      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4"
      >
        {hasMore && (
          <button
            type="button"
            onClick={loadOlder}
            className="self-center text-xs font-semibold text-purple-600"
          >
            Older messages
          </button>
        )}
        {chat && messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center px-10 text-center">
            <p className="text-sm leading-6 text-muted-foreground">
              You haven't chatted with {chat.person?.firstName?.trim() || name} yet.
              Send a message below to start.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.mine ? "justify-end" : "justify-start"}`}
          >
            <div
              data-sent={message.mine ? "" : undefined}
              className={`max-w-[78%] rounded-[1.25rem] px-3.5 py-2 text-sm leading-5 ${
                message.mine
                  ? "rounded-br-md text-white"
                  : "rounded-bl-md bg-[#efefef] text-[#111]"
              }`}
            >
              {message.kind === "photo" && message.photo && (
                <button
                  type="button"
                  onClick={() => setOpenPhoto(message.photo!)}
                  aria-label="Open photo"
                  className="mb-1 block"
                >
                  <img
                    src={message.photo}
                    alt="Photo"
                    className="max-h-64 rounded-xl object-cover"
                  />
                </button>
              )}
              {message.kind === "location" && message.location && (
                <a
                  href={`https://www.google.com/maps?q=${message.location.lat},${message.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-semibold underline"
                >
                  <MapPin className="h-4 w-4" />
                  {message.location.live ? "Live location" : "Location"}
                </a>
              )}
              {editingId === message._id ? (
                <div>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={2000}
                    rows={2}
                    className="w-full resize-none rounded-xl bg-white/15 px-2 py-1 text-sm text-white outline-none"
                  />
                  <p className="mt-1 text-[10px] text-white/80">
                    <button type="button" onClick={() => saveEdit(message._id)} className="underline">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="ml-2 underline">
                      Cancel
                    </button>
                  </p>
                </div>
              ) : (
                message.text && <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
              )}
              <p className={`mt-1 text-[10px] ${message.mine ? "text-white/80" : "text-[#888]"}`}>
                {whenLabel(message.createdAt)}
                {message.editedAt && " · Edited"}
                {message.location?.live && message.mine && (
                  <button type="button" onClick={() => endLive(message._id)} className="ml-2 underline">
                    Stop sharing
                  </button>
                )}
                {canStillEdit(message) && editingId !== message._id && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(message._id);
                      setDraft(message.text);
                      setPendingDelete(null);
                    }}
                    className="ml-2 underline"
                  >
                    Edit
                  </button>
                )}
                {message.mine && pendingDelete !== message._id && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDelete(message._id);
                      setEditingId(null);
                    }}
                    className="ml-2 underline"
                  >
                    Delete
                  </button>
                )}
              </p>
              {message.mine && pendingDelete === message._id && (
                <p className={`text-[10px] ${message.mine ? "text-white/80" : "text-[#888]"}`}>
                  Delete this message?
                  <button type="button" onClick={() => removeMessage(message._id)} className="ml-2 underline">
                    Yes
                  </button>
                  <button type="button" onClick={() => setPendingDelete(null)} className="ml-2 underline">
                    No
                  </button>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {chat && !chat.canMessage ? (
        <p className="border-t border-border px-4 py-4 text-center text-sm text-muted-foreground">
          {chat.blockedByMe ? "You blocked this person." : "You can't message this person."}
        </p>
      ) : (
        <form
          className="flex items-end gap-2 border-t border-border px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            sendText();
          }}
        >
          <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-muted">
            <ImagePlus className="h-5 w-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                sendPhoto(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            aria-label="Take a photo"
            onClick={openCamera}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          >
            <Camera className="h-5 w-5" />
          </button>
          <details className="relative">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full hover:bg-muted">
              <MapPin className="h-5 w-5" />
            </summary>
            <div className="absolute bottom-12 left-0 z-10 w-44 rounded-2xl border border-border bg-card p-1 text-sm shadow-lg">
              <button type="button" className="block w-full rounded-xl px-3 py-2 text-left hover:bg-muted" onClick={() => shareLocation()}>
                Send current location
              </button>
              <button type="button" className="block w-full rounded-xl px-3 py-2 text-left hover:bg-muted" onClick={() => shareLocation(15)}>
                Live for 15 minutes
              </button>
              <button type="button" className="block w-full rounded-xl px-3 py-2 text-left hover:bg-muted" onClick={() => shareLocation(60)}>
                Live for 1 hour
              </button>
              <button type="button" className="block w-full rounded-xl px-3 py-2 text-left hover:bg-muted" onClick={() => shareLocation(480)}>
                Live for 8 hours
              </button>
            </div>
          </details>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Message"
            maxLength={2000}
            className="min-w-0 flex-1 rounded-full border border-border bg-transparent px-4 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            aria-label="Send"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black">
          <video
            ref={cameraVideo}
            autoPlay
            playsInline
            muted
            className="min-h-0 flex-1 -scale-x-100 object-cover"
          />
          <div className="flex items-center justify-center gap-8 px-6 py-6">
            <button
              type="button"
              aria-label="Close camera"
              onClick={stopCamera}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Snap photo"
              onClick={snapPhoto}
              className="h-16 w-16 rounded-full border-4 border-white bg-white/30"
            />
          </div>
        </div>
      )}

      {openPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          onClick={() => setOpenPhoto(null)}
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              aria-label="Download photo"
              onClick={(event) => {
                event.stopPropagation();
                downloadPhoto(openPhoto);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Close photo"
              onClick={() => setOpenPhoto(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <img
            src={openPhoto}
            alt="Photo"
            className="max-h-full max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {reportOpen && chat?.person && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            className="w-full max-w-sm rounded-3xl bg-card p-5"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await reportPerson({
                  userId: chat.person!._id,
                  conversationId,
                  reason,
                  details,
                });
                toast.success("Report sent");
                setReportOpen(false);
              } catch (err) {
                toast.error(getErrorMessage(err as ApiError, "Couldn't send the report"));
              }
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Report {name}</h2>
              <button type="button" aria-label="Close" onClick={() => setReportOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {REPORTS.map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === value}
                    onChange={() => setReason(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="What happened? (optional)"
              className="mt-4 w-full resize-none rounded-2xl border border-border bg-transparent p-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-purple-950 py-3 text-sm font-bold text-white"
            >
              Send report
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatThread;
