import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  getCart,
  getChapters,
  getCourseLearningStatus,
  getCourseDetail,
  getLectures,
} from "../features/shared/api/api";
import { useCategories } from "../features/shared/hooks/useCourseList";
import { useAuth } from "../features/shared/context/AuthContext";
import { CourseCurriculumSection } from "../features/courseDetail/sections/CourseCurriculumSection";
import { CourseHeroSection } from "../features/courseDetail/sections/CourseHeroSection";
import { CourseReviewsSection } from "../features/courseDetail/sections/CourseReviewsSection";
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

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = Number(courseId);
  const { user, isLoggedIn, isInstructor } = useAuth();

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
    enabled: isLoggedIn && !!user && !isInstructor,
    staleTime: 1000 * 30,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart(user!.id, numericCourseId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["cart", user?.id], updatedCart);
    },
  });

  const curriculum = buildCurriculum(
    chaptersQuery.data ?? [],
    lectureQueries.map((q) => q.data ?? [])
  );
  const totals = getCurriculumTotals(curriculum);
  const firstLecture = getFirstLecture(curriculum);
  const course = courseQuery.data;
  const learningStatus = learningStatusQuery.data;
  const isEnrolled = learningStatus?.isEnrolled ?? false;
  const isInCart = !isInstructor && (cartQuery.data?.items.some((item) => item.course.id === numericCourseId) ?? false);
  const isOwnCourse = isLoggedIn && !!user && !!course && course.instructor_id === user.id;
  const canWatch = isEnrolled || isOwnCourse;

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
    if (isInstructor && !isOwnCourse) return;
    if (!isLoggedIn) { navigate("/login"); return; }
    if (canWatch) {
      const targetId = learningStatus?.lastLectureId ?? firstLecture?.id;
      if (targetId) navigate(`/courses/${course.id}/learn/${targetId}`);
      return;
    }
    if (isInCart) { navigate("/cart"); return; }
    addToCartMutation.mutate();
  };

  const cartButtonLabel = () => {
    if (!isLoggedIn) return "로그인하여 수강하기";
    if (learningStatusQuery.isLoading || cartQuery.isLoading) return "불러오는 중...";
    if (isOwnCourse) return "강의 보기";
    if (isEnrolled) return "이어보기";
    if (isInstructor) return "강사 계정은 구매할 수 없습니다";
    if (isInCart) return "장바구니 보기";
    if (addToCartMutation.isPending) return "담는 중...";
    return "장바구니 담기";
  };

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
          onStartLecture={(lectureId) => navigate(`/courses/${course.id}/learn/${lectureId}`)}
        />

        <section className="section">
          <div className="site-container detail-layout">
            <div>
              <CourseCurriculumSection
                curriculum={curriculum}
                lectureCount={totals.lectureCount}
                canWatch={canWatch}
                courseId={course.id}
              />

              <CourseReviewsSection
                courseId={numericCourseId}
                userId={user?.id}
                isLoggedIn={isLoggedIn}
                isEnrolled={isEnrolled}
                canWriteReview={learningStatus?.canWriteReview ?? false}
                progressPercent={learningStatus?.progressPercent ?? 0}
              />
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
                      <div className="progress-bar__fill" style={{ width: `${learningStatus.progressPercent}%` }} />
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
