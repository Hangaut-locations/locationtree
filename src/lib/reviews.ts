import { adminCaller } from "../interceptors/http";

export type ReviewListing = "party" | "property";

export interface ReviewPerson {
  _id: string;
  firstName: string;
  lastName: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ListingComment {
  _id: string;
  comment: string;
  createdAt: string;
  user: ReviewPerson;
  mine: boolean;
  replies: ReviewReply[];
  canReply: boolean;
}

export interface ReviewReply {
  _id: string;
  text: string;
  createdAt: string;
  editedAt: string | null;
  user: ReviewPerson;
  fromHost: boolean;
  mine: boolean;
}

export interface ListingReviews {
  likes: number;
  liked: boolean;
  likedBy: ReviewPerson[];
  comments: ListingComment[];
  canReview: boolean;
}

export const COMMENT_MAX_LENGTH = 1000;

export const reviewsQueryKey = (type: ReviewListing, id: string) => [
  "reviews",
  type,
  id,
];

export const fullName = (person: ReviewPerson) =>
  `${person.firstName} ${person.lastName}`.trim();

export const personLocation = (person: ReviewPerson) =>
  [person.city, person.state, person.country].filter(Boolean).join(", ");

export const getReviews = (type: ReviewListing, id: string, key?: string) =>
  adminCaller
    .get<ListingReviews>(`/reviews/${type}/${id}`, { params: { key } })
    .then((res) => res.data);

export const toggleLike = (type: ReviewListing, id: string, key?: string) =>
  adminCaller
    .post<{ liked: boolean; likes: number }>(`/reviews/${type}/${id}/like`, {
      key,
    })
    .then((res) => res.data);

export const addComment = (
  type: ReviewListing,
  id: string,
  comment: string,
  key?: string,
) =>
  adminCaller
    .post<ListingComment>(`/reviews/${type}/${id}/comments`, { comment, key })
    .then((res) => res.data);

export const deleteComment = (commentId: string) =>
  adminCaller.delete(`/reviews/comments/${commentId}`);

type Thread = { replies: ReviewReply[] };

export const addReply = (commentId: string, text: string, key?: string) =>
  adminCaller
    .post<Thread>(`/reviews/comments/${commentId}/replies`, { text, key })
    .then((res) => res.data);

export const editReply = (
  commentId: string,
  replyId: string,
  text: string,
  key?: string,
) =>
  adminCaller
    .patch<Thread>(`/reviews/comments/${commentId}/replies/${replyId}`, {
      text,
      key,
    })
    .then((res) => res.data);

export const deleteReply = (commentId: string, replyId: string, key?: string) =>
  adminCaller
    .delete<Thread>(`/reviews/comments/${commentId}/replies/${replyId}`, {
      params: { key },
    })
    .then((res) => res.data);
