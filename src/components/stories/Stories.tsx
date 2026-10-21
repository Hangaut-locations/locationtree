import { Heart, Plus, X } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { getErrorMessage, type ApiError } from "../../lib/errors";
import { MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, videoLength } from "../../lib/media";
import {
  commentOnStory,
  deleteStory,
  loveStory,
  saveStory,
  storyList,
  storyViewerId,
  uploadStory,
  type StoryPerson,
} from "../../lib/stories";

const PHOTO_MS = 6000;

type StoryActions = {
  people: StoryPerson[];
  open: (userId: string) => void;
  add: () => void;
  adding: boolean;
};

const StoryContext = createContext<StoryActions | null>(null);

const problem = (err: unknown, fallback: string) =>
  (err as ApiError).response
    ? getErrorMessage(err as ApiError, fallback)
    : err instanceof Error
      ? err.message
      : fallback;

export const StoriesProvider = ({ children }: { children: ReactNode }) => {
  const { data: me } = useAuth();
  const queryClient = useQueryClient();
  const viewerId = useMemo(() => storyViewerId(), []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["stories", viewerId],
    queryFn: () => storyList(viewerId),
    refetchInterval: openId ? 4000 : 20000,
  });
  const people = data?.people ?? [];

  const pick = async (file: File) => {
    const video = file.type.startsWith("video/");
    if (!video && !file.type.startsWith("image/")) {
      toast.error("Choose a photo or a video");
      return;
    }
    if (video && file.size > MAX_VIDEO_BYTES) {
      toast.error("That video is too big");
      return;
    }
    if (!video && file.size > 10 * 1024 * 1024) {
      toast.error("That photo is too big");
      return;
    }
    if (video) {
      const length = await videoLength(file);
      if (length != null && length > MAX_VIDEO_SECONDS) {
        toast.error("Keep the video to 1 minute");
        return;
      }
    }
    setAdding(true);
    try {
      const uploaded = await uploadStory(file, video ? "video" : "photo");
      await saveStory(uploaded.public_id, video ? "video" : "photo");
      await queryClient.invalidateQueries({ queryKey: ["stories"] });
      if (me?._id) setOpenId(String(me._id));
      toast.success("Added to your story");
    } catch (err) {
      toast.error(problem(err, "Couldn't add that to your story"));
    } finally {
      setAdding(false);
    }
  };

  return (
    <StoryContext.Provider
      value={{ people, open: setOpenId, add: () => fileRef.current?.click(), adding }}
    >
      {children}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void pick(file);
        }}
      />
      {openId && (
        <StoryViewer
          userId={openId}
          people={people}
          viewerId={viewerId}
          onClose={() => setOpenId(null)}
        />
      )}
    </StoryContext.Provider>
  );
};

/** Letter circle. A pink ring means this person has a story. The plus adds one. */
export const StoryFace = ({
  userId,
  initials,
  className,
  mine = false,
}: {
  userId?: string;
  initials: string;
  className: string;
  mine?: boolean;
}) => {
  const stories = useContext(StoryContext);
  const hasStory = Boolean(
    userId && stories?.people.some((person) => person.userId === userId && person.items.length),
  );
  const circle = hasStory ? (
    <button
      type="button"
      onClick={() => userId && stories?.open(userId)}
      className={`${className} ring-2 ring-pink-500 ring-offset-2`}
      aria-label="Watch story"
    >
      {initials}
    </button>
  ) : (
    <div className={className}>{initials}</div>
  );

  return (
    <div className="relative inline-flex shrink-0">
      {circle}
      {mine && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            stories?.add();
          }}
          disabled={stories?.adding}
          aria-label="Add to your story"
          className="absolute -bottom-1 left-1/2 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-pink-500 text-white disabled:opacity-60"
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

const StoryViewer = ({
  userId,
  people,
  viewerId,
  onClose,
}: {
  userId: string;
  people: StoryPerson[];
  viewerId: string;
  onClose: () => void;
}) => {
  const { data: me } = useAuth();
  const queryClient = useQueryClient();
  const person = people.find((item) => item.userId === userId);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState(
    () => localStorage.getItem("hangaut_story_name") ?? "",
  );
  const [text, setText] = useState("");
  const item = person?.items[index];
  const mine = Boolean(me?._id && String(me._id) === userId);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!person) return;
    if (index > person.items.length - 1) setIndex(0);
  }, [person, index]);

  useEffect(() => {
    if (!item || item.kind !== "photo") return;
    const timer = window.setTimeout(() => {
      setIndex((current) =>
        person && current < person.items.length - 1 ? current + 1 : current,
      );
    }, PHOTO_MS);
    return () => window.clearTimeout(timer);
  }, [item, person]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["stories"] });

  const comment = useMutation({
    mutationFn: () => commentOnStory(item!.id, viewerId, name.trim(), text.trim()),
    onSuccess: () => {
      localStorage.setItem("hangaut_story_name", name.trim());
      setText("");
      void refresh();
    },
    onError: (err) => toast.error(problem(err, "Couldn't post that comment")),
  });

  const love = useMutation({
    mutationFn: () => loveStory(item!.id, viewerId),
    onSuccess: () => void refresh(),
    onError: (err) => toast.error(problem(err, "Couldn't save that love")),
  });

  const remove = useMutation({
    mutationFn: () => deleteStory(item!.id),
    onSuccess: () => {
      toast.success("Story removed");
      void refresh();
      onClose();
    },
    onError: (err) => toast.error(problem(err, "Couldn't remove that story")),
  });

  const step = (dir: number) => {
    if (!person) return;
    const next = index + dir;
    if (next < 0 || next >= person.items.length) return;
    setIndex(next);
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Story"
    >
      <div className="mx-auto flex h-full max-w-lg flex-col">
        <div className="flex gap-1 px-3 pt-3">
          {(person?.items ?? [{ id: "empty" }]).map((bar, barIndex) => (
            <span
              key={bar.id}
              className={`h-0.5 flex-1 rounded-full ${barIndex <= index ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <p className="truncate text-sm font-semibold">
            {person
              ? `${person.firstName} ${person.lastName}`.trim() || "Story"
              : "Story"}
          </p>
          <button type="button" onClick={onClose} aria-label="Close story" className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          {item?.kind === "video" ? (
            <video
              key={item.id}
              src={item.url}
              poster={item.poster}
              className="h-full w-full object-contain"
              autoPlay
              playsInline
              controls
              onEnded={() => step(1)}
            />
          ) : item ? (
            <img src={item.url} alt="" className="h-full w-full object-contain" />
          ) : (
            <p className="px-6 pt-16 text-center text-sm">This story has ended</p>
          )}
          <button
            type="button"
            aria-label="Previous"
            className="absolute left-0 top-0 h-[65%] w-1/3"
            onClick={() => step(-1)}
          />
          <button
            type="button"
            aria-label="Next"
            className="absolute right-0 top-0 h-[65%] w-1/3"
            onClick={() => step(1)}
          />

          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-4 pt-16"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-2 text-[11px] text-white/70">Gone after 24 hours</p>
            <div className="mb-2 max-h-28 space-y-1 overflow-y-auto text-sm">
              {item?.comments.map((comment) => (
                <p key={comment.id}>
                  <span className="font-semibold">{comment.name}</span> {comment.text}
                </p>
              ))}
            </div>
            {item && (
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  aria-label={item.loved ? "Remove love" : "Love this story"}
                  onClick={() => love.mutate()}
                  className="flex items-center gap-1 pb-2"
                >
                  <Heart
                    className={`h-6 w-6 ${item.loved ? "fill-pink-500 text-pink-500" : ""}`}
                  />
                  <span className="text-xs">{item.loves}</span>
                </button>
                <form
                  className="flex min-w-0 flex-1 flex-col gap-1"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!text.trim() || comment.isPending) return;
                    comment.mutate();
                  }}
                >
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value.slice(0, 24))}
                    placeholder="Your name"
                    aria-label="Your name"
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs outline-none"
                  />
                  <div className="flex gap-1">
                    <input
                      value={text}
                      onChange={(event) => setText(event.target.value.slice(0, 200))}
                      placeholder="Comment"
                      aria-label="Comment"
                      className="min-w-0 flex-1 rounded-full bg-white/10 px-3 py-2 text-sm outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!text.trim() || comment.isPending}
                      className="rounded-full bg-white px-3 text-xs font-bold text-black disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}
            {mine && item && (
              <button
                type="button"
                onClick={() => remove.mutate()}
                disabled={remove.isPending}
                className="mt-2 text-xs text-white/70 underline"
              >
                Remove this story
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
