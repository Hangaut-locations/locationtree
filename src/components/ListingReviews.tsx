import { useState } from "react";
import { MapPin, Pencil, Reply, ThumbsUp, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import useAuth from "./hooks/useAuth";
import useAppContext from "./hooks/useAppContext";
import { getErrorMessage, type ApiError } from "../lib/errors";
import { linkKey } from "../lib/privateLink";
import {
  addComment,
  COMMENT_MAX_LENGTH,
  deleteComment,
  deleteReply,
  fullName,
  getReviews,
  type ListingReviews as Reviews,
  personLocation,
  type ReviewListing,
  type ReviewPerson,
  reviewsQueryKey,
  setReply,
  toggleLike,
} from "../lib/reviews";

interface ListingReviewsProps {
  type: ReviewListing;
  id: string;
}

const initials = (person: ReviewPerson) =>
  `${person.firstName?.[0] ?? ""}${person.lastName?.[0] ?? ""}`.toUpperCase();

const reviewDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const Avatar = ({ person }: { person: ReviewPerson }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
    {initials(person)}
  </span>
);

const PersonLine = ({ person }: { person: ReviewPerson }) => (
  <div className="min-w-0">
    <p className="truncate text-sm font-semibold">{fullName(person)}</p>
    {personLocation(person) && (
      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" /> {personLocation(person)}
      </p>
    )}
  </div>
);

const likedBySummary = (people: ReviewPerson[], total: number) => {
  if (total === 0) return "Be the first to like this";
  const names = people.slice(0, 2).map(fullName);
  const others = total - names.length;
  if (others <= 0) return `Liked by ${names.join(" and ")}`;
  return `Liked by ${names.join(", ")} and ${others} other${others === 1 ? "" : "s"}`;
};

const ListingReviews = ({ type, id }: ListingReviewsProps) => {
  const qc = useQueryClient();
  const { data: user } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const [comment, setComment] = useState("");
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const key = linkKey();
  const queryKey = [...reviewsQueryKey(type, id), user?._id ?? "guest"];
  const listingName = type === "party" ? "party" : "place";

  const { data, isLoading } = useQuery<Reviews>({
    queryKey,
    queryFn: () => getReviews(type, id, key),
  });

  const refresh = () =>
    qc.invalidateQueries({ queryKey: reviewsQueryKey(type, id) });

  const like = useMutation({
    mutationFn: () => toggleLike(type, id, key),
    onSuccess: ({ liked, likes }) => {
      qc.setQueryData<Reviews>(queryKey, (old) =>
        old ? { ...old, liked, likes } : old,
      );
      refresh();
    },
    onError: (err: ApiError) =>
      toast.error(getErrorMessage(err, "Couldn't like it, try again")),
  });

  const post = useMutation({
    mutationFn: (text: string) => addComment(type, id, text, key),
    onSuccess: () => {
      setComment("");
      toast.success("Thanks for your review!");
      refresh();
    },
    onError: (err: ApiError) =>
      toast.error(getErrorMessage(err, "Couldn't post your review, try again")),
  });

  const remove = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast.success("Review deleted");
      refresh();
    },
    onError: (err: ApiError) =>
      toast.error(getErrorMessage(err, "Couldn't delete it, try again")),
  });

  const saveReply = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      setReply(commentId, text),
    onSuccess: () => {
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply posted");
      refresh();
    },
    onError: (err: ApiError) =>
      toast.error(getErrorMessage(err, "Couldn't post your reply, try again")),
  });

  const removeReply = useMutation({
    mutationFn: deleteReply,
    onSuccess: () => {
      toast.success("Reply deleted");
      refresh();
    },
    onError: (err: ApiError) =>
      toast.error(getErrorMessage(err, "Couldn't delete it, try again")),
  });

  const handleLike = () => {
    if (!user) {
      setIsAuthModal(true);
      return;
    }
    like.mutate();
  };

  const handlePost = () => {
    const text = comment.trim();
    if (text) post.mutate(text);
  };

  const startReply = (commentId: string, text = "") => {
    setReplyingTo(commentId);
    setReplyText(text);
  };

  const handleReply = () => {
    const text = replyText.trim();
    if (replyingTo && text) saveReply.mutate({ commentId: replyingTo, text });
  };

  const likes = data?.likes ?? 0;
  const comments = data?.comments ?? [];

  return (
    <section id="reviews" className="py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          Reviews{comments.length > 0 && ` (${comments.length})`}
        </h2>
        <button
          type="button"
          onClick={handleLike}
          disabled={like.isPending || (!!user && data && !data.canReview)}
          aria-pressed={!!data?.liked}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
            data?.liked
              ? "border-purple-500 bg-purple-500 text-white hover:bg-purple-600"
              : "border-border hover:bg-muted"
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${data?.liked ? "fill-white" : ""}`} />
          {likes}
        </button>
      </div>

      <button
        type="button"
        onClick={() => likes > 0 && setIsLikesOpen(true)}
        disabled={likes === 0}
        className="mt-2 text-left text-sm text-muted-foreground enabled:hover:underline"
      >
        {isLoading ? "Loading..." : likedBySummary(data?.likedBy ?? [], likes)}
      </button>

      {data?.canReview && (
        <div className="mt-5 rounded-2xl border border-border p-4">
          <textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value.slice(0, COMMENT_MAX_LENGTH))
            }
            rows={3}
            placeholder={`How was this ${listingName}? Share it with others`}
            className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </span>
            <button
              type="button"
              onClick={handlePost}
              disabled={!comment.trim() || post.isPending}
              className="rounded-xl bg-purple-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-50"
            >
              {post.isPending ? "Posting..." : "Post review"}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <button
          type="button"
          onClick={() => setIsAuthModal(true)}
          className="mt-5 w-full rounded-2xl border border-dashed border-border p-4 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          Log in to like or leave a review
        </button>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="mt-5 text-sm text-muted-foreground">
          No reviews yet.
          {data?.canReview && " Be the first to share how it was."}
        </p>
      )}

      <ul className="mt-6 space-y-6">
        {comments.map((item) => (
          <li key={item._id} className="flex gap-3">
            <Avatar person={item.user} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <PersonLine person={item.user} />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {reviewDate(item.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line wrap-break-word text-sm leading-6">
                {item.comment}
              </p>
              {item.mine && (
                <button
                  type="button"
                  onClick={() => remove.mutate(item._id)}
                  disabled={remove.isPending}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              )}

              {item.reply && replyingTo !== item._id && (
                <div className="mt-3 rounded-2xl bg-muted/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">Reply from the host</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {reviewDate(item.reply.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line wrap-break-word text-sm leading-6">
                    {item.reply.text}
                  </p>
                  {data?.canReply && (
                    <div className="mt-2 flex gap-4 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() =>
                          startReply(item._id, item.reply?.text ?? "")
                        }
                        className="flex items-center gap-1 hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeReply.mutate(item._id)}
                        disabled={removeReply.isPending}
                        className="flex items-center gap-1 text-red-600 hover:underline disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {data?.canReply && !item.reply && replyingTo !== item._id && (
                <button
                  type="button"
                  onClick={() => startReply(item._id)}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-300"
                >
                  <Reply className="h-3.5 w-3.5" /> Reply
                </button>
              )}

              {replyingTo === item._id && (
                <div className="mt-3 rounded-2xl border border-border p-3">
                  <textarea
                    value={replyText}
                    onChange={(e) =>
                      setReplyText(e.target.value.slice(0, COMMENT_MAX_LENGTH))
                    }
                    rows={2}
                    placeholder={`Reply to ${item.user.firstName}`}
                    className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {replyText.length}/{COMMENT_MAX_LENGTH}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleReply}
                        disabled={!replyText.trim() || saveReply.isPending}
                        className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-50"
                      >
                        {saveReply.isPending ? "Posting..." : "Post reply"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        open={isLikesOpen}
        onOpenChange={(isOpen) => !isOpen && setIsLikesOpen(false)}
      >
        <DialogContent className="max-w-[calc(100%-2rem)] grid-cols-[minmax(0,1fr)] gap-0 rounded-3xl bg-card p-6 sm:max-w-md">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ThumbsUp className="h-5 w-5 fill-purple-500 text-purple-500" />
            {likes} {likes === 1 ? "like" : "likes"}
          </DialogTitle>
          <ul className="mt-5 max-h-[60vh] space-y-4 overflow-y-auto">
            {data?.likedBy.map((person) => (
              <li key={person._id} className="flex items-center gap-3">
                <Avatar person={person} />
                <PersonLine person={person} />
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ListingReviews;
