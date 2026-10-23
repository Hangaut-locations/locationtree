import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { getErrorMessage, type ApiError } from "../lib/errors";
import { linkKey } from "../lib/privateLink";
import {
  COMMENT_MAX_LENGTH,
  addComment,
  addReply,
  deleteReply,
  fullName,
  getReviews,
  type ListingComment,
  type ListingReviews,
  type ReviewListing,
  type ReviewPerson,
  reviewsQueryKey,
} from "../lib/reviews";
import useAppContext from "./hooks/useAppContext";
import useAuth from "./hooks/useAuth";

const initials = (person: { firstName?: string; lastName?: string }) =>
  `${person.firstName?.[0] ?? ""}${person.lastName?.[0] ?? ""}`.toUpperCase() || "?";

const ago = (date: string) => {
  const seconds = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const Face = ({ person, small }: { person: ReviewPerson; small?: boolean }) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-full bg-white/15 font-semibold ${
      small ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs"
    }`}
  >
    {initials(person)}
  </span>
);

/** Reviews for one listing, read like Instagram comments. A reply sits under that review. */
const ReviewSheet = ({
  type,
  id,
  onClose,
}: {
  type: ReviewListing;
  id: string;
  onClose: () => void;
}) => {
  const { data: user } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const qc = useQueryClient();
  const key = linkKey();
  const queryKey = [...reviewsQueryKey(type, id), user?._id ?? "guest"];
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<ListingComment | null>(null);
  const [replyName, setReplyName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<ListingReviews>({
    queryKey,
    queryFn: () => getReviews(type, id, key),
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const refresh = () => qc.invalidateQueries({ queryKey: reviewsQueryKey(type, id) });

  type Posted =
    | { kind: "review"; saved: ListingComment }
    | { kind: "reply"; replyId: string; thread: Awaited<ReturnType<typeof addReply>> };

  const post = useMutation<Posted, ApiError, { replyId?: string; body: string }>({
    mutationFn: async ({ replyId, body }) => {
      if (replyId) {
        const thread = await addReply(replyId, body, key);
        return { kind: "reply" as const, replyId, thread };
      }
      const saved = await addComment(type, id, body, key);
      return { kind: "review" as const, saved };
    },
    onSuccess: (result) => {
      if (result.kind === "review") {
        qc.setQueryData<ListingReviews>(queryKey, (old) =>
          old ? { ...old, comments: [result.saved, ...old.comments] } : old,
        );
        toast.success("Your review is posted");
      } else {
        qc.setQueryData<ListingReviews>(queryKey, (old) =>
          old
            ? {
                ...old,
                comments: old.comments.map((item) =>
                  item._id === result.replyId ? { ...item, replies: result.thread.replies } : item,
                ),
              }
            : old,
        );
      }
      setText("");
      setReplyTo(null);
      setReplyName("");
      refresh();
    },
    onError: (err: ApiError) =>
      toast.error(
        getErrorMessage(
          err,
          replyTo ? "Couldn't post your reply, try again" : "Couldn't post your review, try again",
        ),
      ),
  });

  const remove = useMutation({
    mutationFn: ({ commentId, replyId }: { commentId: string; replyId: string }) =>
      deleteReply(commentId, replyId, key),
    onSuccess: ({ replies }, { commentId }) => {
      qc.setQueryData<ListingReviews>(queryKey, (old) =>
        old
          ? {
              ...old,
              comments: old.comments.map((item) =>
                item._id === commentId ? { ...item, replies } : item,
              ),
            }
          : old,
      );
      refresh();
    },
    onError: (err: ApiError) => toast.error(getErrorMessage(err, "Couldn't delete it, try again")),
  });

  const comments = data?.comments ?? [];

  const beginReply = (comment: ListingComment, name: string) => {
    if (!user) {
      setIsAuthModal(true);
      return;
    }
    setReplyTo(comment);
    setReplyName(name);
    setText("");
    // Focus during the tap. A later focus does not open the phone keyboard.
    inputRef.current?.focus();
  };

  return (
    <div
      className="absolute inset-0 z-20 flex items-end bg-black/55"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Reviews"
        className="flex h-[78%] w-full flex-col rounded-t-3xl bg-neutral-950 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/30" />
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-bold">
            Reviews{comments.length > 0 ? ` ${comments.length}` : ""}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white/10 cursor-pointer"
            aria-label="Close reviews"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {isLoading && <li className="text-sm text-white/60">Loading...</li>}
          {!isLoading && comments.length === 0 && (
            <li className="py-10 text-center text-sm text-white/60">No reviews yet.</li>
          )}
          {comments.map((item) => (
            <li key={item._id}>
              <div className="flex gap-3">
                <Face person={item.user} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5">
                    <span className="font-semibold">{fullName(item.user)}</span>{" "}
                    <span className="whitespace-pre-line wrap-break-word">{item.comment}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-3 text-xs font-semibold text-white/50">
                    <span className="font-normal">{ago(item.createdAt)}</span>
                    <button
                      type="button"
                      onClick={() => beginReply(item, item.user.firstName)}
                      className="cursor-pointer hover:text-white"
                    >
                      Reply
                    </button>
                  </p>
                </div>
              </div>

              {item.replies.length > 0 && (
                <ul className="mt-3 space-y-3 pl-11">
                  {item.replies.map((reply) => (
                    <li key={reply._id} className="flex gap-3">
                      <Face person={reply.user} small />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-5">
                          <span className="font-semibold">{fullName(reply.user)}</span>
                          {reply.fromHost && (
                            <span className="ml-1.5 text-[10px] font-bold uppercase text-white/50">
                              Host
                            </span>
                          )}{" "}
                          <span className="whitespace-pre-line wrap-break-word">{reply.text}</span>
                        </p>
                        <p className="mt-1 flex items-center gap-3 text-xs font-semibold text-white/50">
                          <span className="font-normal">
                            {ago(reply.createdAt)}
                            {reply.editedAt ? " · edited" : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => beginReply(item, reply.user.firstName)}
                            className="cursor-pointer hover:text-white"
                          >
                            Reply
                          </button>
                          {reply.mine && (
                            <button
                              type="button"
                              onClick={() =>
                                remove.mutate({ commentId: item._id, replyId: reply._id })
                              }
                              disabled={remove.isPending}
                              className="cursor-pointer hover:text-white disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <form
          className="border-t border-white/10 px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            const body = text.trim();
            if (!body) return;
            if (!user) {
              setIsAuthModal(true);
              return;
            }
            post.mutate({ replyId: replyTo?._id, body });
          }}
        >
          {replyTo && (
            <p className="mb-2 flex items-center justify-between text-xs text-white/60">
              Replying to {replyName}
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setReplyName("");
                  setText("");
                }}
                className="font-semibold text-white cursor-pointer"
              >
                Cancel
              </button>
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
              {user ? initials(user) : "?"}
            </span>
            <input
              ref={inputRef}
              value={text}
              onChange={(event) => setText(event.target.value.slice(0, COMMENT_MAX_LENGTH))}
              maxLength={COMMENT_MAX_LENGTH}
              placeholder={replyTo ? `Reply to ${replyName}...` : "Tap to leave a review"}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={!text.trim() || post.isPending}
              className="text-sm font-bold text-purple-400 disabled:opacity-30 cursor-pointer"
            >
              {post.isPending ? "Posting" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewSheet;
