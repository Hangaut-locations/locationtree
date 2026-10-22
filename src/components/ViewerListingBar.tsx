import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import ReviewSheet from "./ReviewSheet";
import { getErrorMessage, type ApiError } from "../lib/errors";
import { linkKey } from "../lib/privateLink";
import {
  COMMENT_MAX_LENGTH,
  addComment,
  getReviews,
  reviewsQueryKey,
  toggleLike,
  type ReviewListing,
} from "../lib/reviews";
import MessageButton from "./chat/MessageButton";
import useAppContext from "./hooks/useAppContext";
import useAuth from "./hooks/useAuth";

const buttonClass =
  "flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50 cursor-pointer";

const sameId = (left?: string, right?: string) => !!left && !!right && String(left) === String(right);

/** Thumbs up, message the host, and a review field. Sits with share and save on the full-screen photos. */
const ViewerListingBar = ({
  type,
  id,
  hostId,
}: {
  type: ReviewListing;
  id: string;
  hostId?: string;
}) => {
  const { data: user } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const qc = useQueryClient();
  const key = linkKey();
  const [comment, setComment] = useState("");
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const queryKey = [...reviewsQueryKey(type, id), user?._id ?? "guest"];
  const isHost = sameId(user?._id, hostId);

  const { data } = useQuery({
    queryKey,
    queryFn: () => getReviews(type, id, key),
  });

  const like = useMutation({
    mutationFn: () => toggleLike(type, id, key),
    onSuccess: ({ liked, likes }) => {
      qc.setQueryData(queryKey, (old: typeof data) => (old ? { ...old, liked, likes } : old));
      qc.invalidateQueries({ queryKey: reviewsQueryKey(type, id) });
    },
    onError: (err: ApiError) => toast.error(getErrorMessage(err, "Couldn't like it, try again")),
  });

  const post = useMutation({
    mutationFn: (text: string) => addComment(type, id, text, key),
    onSuccess: () => {
      setComment("");
      toast.success("Your review is posted");
      qc.invalidateQueries({ queryKey: reviewsQueryKey(type, id) });
    },
    onError: (err: ApiError) => toast.error(getErrorMessage(err, "Couldn't post your review, try again")),
  });

  const needLogin = () => {
    setIsAuthModal(true);
  };

  const reviewCount = data?.comments.length ?? 0;
  const seeReviews = (
    <>
      <button
        type="button"
        onClick={() => setReviewsOpen(true)}
        className={buttonClass}
        aria-label="See reviews"
      >
        See reviews{reviewCount > 0 ? ` ${reviewCount}` : ""}
      </button>
      {reviewsOpen && (
        <ReviewSheet type={type} id={id} onClose={() => setReviewsOpen(false)} />
      )}
    </>
  );

  if (isHost) return seeReviews;

  return (
    <>
      <button
        type="button"
        onClick={() => (user ? like.mutate() : needLogin())}
        disabled={like.isPending}
        aria-pressed={!!data?.liked}
        className={buttonClass}
        aria-label="Thumbs up"
      >
        <ThumbsUp className={`h-4 w-4 ${data?.liked ? "fill-white" : ""}`} />
        {data?.likes ?? 0}
      </button>
      {hostId && (
        <div className="flex items-center gap-2">
          <MessageButton
            userId={hostId}
            listingType={type}
            listingId={id}
            label="Message host"
            className={buttonClass}
          />
          <button
            type="button"
            onClick={() => setReviewsOpen(true)}
            className={buttonClass}
            aria-label="See reviews"
          >
            See reviews{reviewCount > 0 ? ` ${reviewCount}` : ""}
          </button>
        </div>
      )}
      {!hostId && (
        <button
          type="button"
          onClick={() => setReviewsOpen(true)}
          className={buttonClass}
          aria-label="See reviews"
        >
          See reviews{reviewCount > 0 ? ` ${reviewCount}` : ""}
        </button>
      )}
      {reviewsOpen && (
        <ReviewSheet type={type} id={id} onClose={() => setReviewsOpen(false)} />
      )}
      <form
        className="flex min-w-48 flex-1 items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = comment.trim();
          if (!text) return;
          if (!user) {
            needLogin();
            return;
          }
          post.mutate(text);
        }}
      >
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value.slice(0, COMMENT_MAX_LENGTH))}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="Leave a review"
          className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white outline-none placeholder:text-white/60"
        />
        <button type="submit" disabled={!comment.trim() || post.isPending} className={buttonClass}>
          {post.isPending ? "Posting..." : "Post"}
        </button>
      </form>
    </>
  );
};

export default ViewerListingBar;
