import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCourseReviews } from "../../shared/api/api";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewForm } from "../components/ReviewForm";

interface Props {
  courseId: number;
  userId: number | undefined;
  isLoggedIn: boolean;
  isEnrolled: boolean;
  canWriteReview: boolean;
  progressPercent: number;
}

export function CourseReviewsSection({
  courseId,
  userId,
  isLoggedIn,
  isEnrolled,
  canWriteReview,
  progressPercent,
}: Props) {
  const queryClient = useQueryClient();

  const { data: reviews = [], isError: reviewsError } = useQuery({
    queryKey: ["reviews", courseId],
    queryFn: () => getCourseReviews(courseId),
    enabled: Number.isFinite(courseId),
  });

  const avgStar =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.star, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="reviews-section">
      <div className="section-heading" style={{ marginBottom: 20 }}>
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 style={{ fontSize: "1.6rem" }}>
            수강 리뷰 {avgStar ? `⭐ ${avgStar}` : ""}
          </h2>
        </div>
        <span className="section-copy">{reviews.length}개의 리뷰</span>
      </div>

      {reviewsError ? (
        <div className="empty-state" style={{ marginTop: 0 }}>
          <strong>리뷰를 불러오지 못했습니다</strong>
          <p>잠시 후 다시 시도해주세요.</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 0 }}>
          <strong>아직 리뷰가 없습니다</strong>
          <p>이 강의를 80% 이상 수료하면 리뷰를 남길 수 있어요.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {isLoggedIn && canWriteReview && (
        <ReviewForm
          courseId={courseId}
          userId={userId!}
          existingReview={reviews.find((r) => r.user.id === userId) ?? null}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["reviews", courseId] })
          }
        />
      )}

      {isLoggedIn && isEnrolled && !canWriteReview && (
        <p className="section-copy" style={{ marginTop: 16 }}>
          진도율 80% 이상이 되면 리뷰를 작성할 수 있습니다. (현재 {progressPercent}%)
        </p>
      )}

      {!isLoggedIn && (
        <p className="section-copy" style={{ marginTop: 16 }}>
          리뷰를 작성하려면{" "}
          <Link to="/login" className="auth-card__link">로그인</Link>이 필요합니다.
        </p>
      )}
    </div>
  );
}
