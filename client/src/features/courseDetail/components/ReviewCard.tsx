import type { CourseReview } from "../../shared/types";
import { formatDate } from "../../shared/utils";
import { StarRating } from "./StarRating";

export function ReviewCard({ review }: { review: CourseReview }) {
  return (
    <div className="review-card">
      <div className="review-card__header">
        <span className="review-card__name">{review.user.name}</span>
        <StarRating value={review.star} />
        <span className="review-card__date">{formatDate(review.created_at)}</span>
      </div>
      <strong className="review-card__title">{review.title}</strong>
      <p className="review-card__content">{review.content}</p>
    </div>
  );
}
