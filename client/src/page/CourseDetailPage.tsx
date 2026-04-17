import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  createCourseReview,
  getCart,
  getChapters,
  getCourseLearningStatus,
  getCourseDetail,
  getCourseReviews,
  getLectures,
} from "../features/shared/api/api";
import { useCategories } from "../features/shared/hooks/useCourseList";
import { useAuth } from "../features/shared/context/AuthContext";
import { CourseCurriculumSection } from "../features/courseDetail/sections/CourseCurriculumSection";
import { CourseHeroSection } from "../features/courseDetail/sections/CourseHeroSection";
import { SiteFooter } from "../features/shared/layout/SiteFooter";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import {
  buildCurriculum,
  getCategoryName,
  getCurriculumTotals,
  getDifficultyAccent,
  getFirstLecture,
  formatDate,
} from "../features/shared/utils";
import type { CourseReview } from "../features/shared/types";

function StarRating({ value }: { value: number }) {
  return (
    <span className="review-stars" aria-label={`${value}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < value ? "#fbbf24" : "#374151" }}>★</span>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: CourseReview }) {
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

function ReviewForm({
  courseId,
  userId,
  onSuccess,
}: {
  courseId: number;
  userId: number;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [star, setStar] = useState(5);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createCourseReview(courseId, { userId, title, content, star }),
    onSuccess: () => {
      setTitle("");
      setContent("");
      setStar(5);
      setError(null);
      onSuccess();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "리뷰 저장에 실패했습니다.");
    },
  });

  return (
    <form
      className="review-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mutation.mutate();
      }}
    >
      <p className="eyebrow">Review</p>
      <h3>리뷰 작성</h3>

      <div className="review-form__star-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="review-form__star"
            onClick={() => setStar(n)}
            style={{ color: n <= star ? "#fbbf24" : "#374151" }}
            aria-label={`${n}점`}
          >
            ★
          </button>
        ))}
        <span style={{ color: "#90a7bf", marginLeft: 6 }}>{star}점</span>
      </div>

      <input
        className="auth-form__input"
        placeholder="제목 (최대 80자)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={80}
        required
      />
      <textarea
        className="auth-form__input auth-form__textarea"
        placeholder="상세 리뷰를 작성해주세요 (최소 10자, 최대 1000자)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        minLength={10}
        maxLength={1000}
        rows={4}
        required
      />

      {error && <p className="auth-form__error">{error}</p>}

      <button
        type="submit"
        className="button button--primary"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "저장 중..." : "리뷰 등록"}
      </button>
    </form>
  );
}

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = Number(courseId);
  const { user, isLoggedIn } = useAuth();

  const { data: categories = [] } = useCategories();

  const courseQuery = useQuery({
    queryKey: ["course", numericCourseId],
    queryFn: () => getCourseDetail(numericCourseId),
    enabled: Number.isFinite(numericCourseId),
  });

  const chaptersQuery = useQuery({
    queryKey: ["chapters", numericCourseId],
    queryFn: () => getChapters(numericCourseId),
    enabled: Number.isFinite(numericCourseId),
  });

  const lectureQueries = useQueries({
    queries: (chaptersQuery.data ?? []).map((chapter) => ({
      queryKey: ["lectures", chapter.id],
      queryFn: () => getLectures(chapter.id),
      enabled: true,
    })),
  });

  const learningStatusQuery = useQuery({
    queryKey: ["learning-status", user?.id, numericCourseId],
    queryFn: () => getCourseLearningStatus(user!.id, numericCourseId),
    enabled: isLoggedIn && !!user && Number.isFinite(numericCourseId),
  });

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getCart(user!.id),
    enabled: isLoggedIn && !!user,
    staleTime: 1000 * 30,
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", numericCourseId],
    queryFn: () => getCourseReviews(numericCourseId),
    enabled: Number.isFinite(numericCourseId),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart(user!.id, numericCourseId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["cart", user?.id], updatedCart);
    },
  });

  const curriculum = buildCurriculum(
    chaptersQuery.data ?? [],
    lectureQueries.map((query) => query.data ?? [])
  );
  const totals = getCurriculumTotals(curriculum);
  const firstLecture = getFirstLecture(curriculum);
  const course = courseQuery.data;
  const learningStatus = learningStatusQuery.data;
  const isEnrolled = learningStatus?.isEnrolled ?? false;
  const isInCart = cartQuery.data?.items.some(
    (item) => item.course.id === numericCourseId
  ) ?? false;

  if (courseQuery.isLoading) {
    return <div className="app-loading">강의 정보를 불러오는 중...</div>;
  }

  if (!course) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container empty-state">
            <strong>강의를 찾을 수 없습니다.</strong>
            <p>{courseId}에 해당하는 강의 데이터가 없습니다.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const categoryName = getCategoryName(course.category_id, categories);
  const accentColor = getDifficultyAccent(course.difficulty);

  const handleCartAction = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (isEnrolled && learningStatus?.lastLectureId) {
      navigate(`/courses/${course.id}/learn/${learningStatus.lastLectureId}`);
    } else if (isEnrolled) {
      navigate(`/courses/${course.id}/learn/${firstLecture?.id}`);
    } else if (isInCart) {
      navigate("/cart");
    } else {
      addToCartMutation.mutate();
    }
  };

  const cartButtonLabel = () => {
    if (!isLoggedIn) return "로그인하여 수강하기";
    if (learningStatusQuery.isLoading || cartQuery.isLoading) return "불러오는 중...";
    if (isEnrolled) return "이어보기";
    if (isInCart) return "장바구니 보기";
    if (addToCartMutation.isPending) return "담는 중...";
    return "장바구니 담기";
  };

  const reviews = reviewsQuery.data ?? [];
  const avgStar =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.star, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <CourseHeroSection
          course={course}
          categoryName={categoryName}
          accentColor={accentColor}
          lectureCount={totals.lectureCount}
          totalDuration={totals.totalDuration}
          firstLecture={firstLecture}
          isEnrolled={isEnrolled}
          isInCart={isInCart}
          progressPercent={learningStatus?.progressPercent}
          cartButtonLabel={cartButtonLabel()}
          onCartAction={handleCartAction}
          onStartLecture={(lectureId) =>
            navigate(`/courses/${course.id}/learn/${lectureId}`)
          }
        />

        <section className="section">
          <div className="site-container detail-layout">
            <div>
              <CourseCurriculumSection
                curriculum={curriculum}
                lectureCount={totals.lectureCount}
              />

              {/* Reviews */}
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

                {reviews.length === 0 ? (
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

                {isLoggedIn && learningStatus?.canWriteReview && (
                  <ReviewForm
                    courseId={numericCourseId}
                    userId={user!.id}
                    onSuccess={() =>
                      queryClient.invalidateQueries({
                        queryKey: ["reviews", numericCourseId],
                      })
                    }
                  />
                )}

                {isLoggedIn && isEnrolled && !learningStatus?.canWriteReview && (
                  <p className="section-copy" style={{ marginTop: 16 }}>
                    진도율 80% 이상이 되면 리뷰를 작성할 수 있습니다. (현재 {learningStatus?.progressPercent ?? 0}%)
                  </p>
                )}

                {!isLoggedIn && (
                  <p className="section-copy" style={{ marginTop: 16 }}>
                    리뷰를 작성하려면{" "}
                    <Link to="/login" className="auth-card__link">
                      로그인
                    </Link>
                    이 필요합니다.
                  </p>
                )}
              </div>
            </div>

            <aside className="detail-summary">
              <div className="summary-card">
                <p className="eyebrow">강의 요약</p>
                <ul>
                  <li>카테고리: {categoryName}</li>
                  <li>생성일: {formatDate(course.created_at)}</li>
                </ul>
              </div>

              {isEnrolled && learningStatus && (
                <div className="summary-card" style={{ marginTop: 14 }}>
                  <p className="eyebrow">내 진도</p>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div className="progress-bar">
                      <div
                        className="progress-bar__fill"
                        style={{ width: `${learningStatus.progressPercent}%` }}
                      />
                    </div>
                    <ul>
                      <li>진도율: {learningStatus.progressPercent}%</li>
                      <li>북마크: {learningStatus.bookmarkCount}개</li>
                      <li>총 시청: {Math.round(learningStatus.totalWatchedSeconds / 60)}분</li>
                    </ul>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
