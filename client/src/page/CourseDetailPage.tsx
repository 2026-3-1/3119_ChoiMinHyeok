import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToCart,
  createReport,
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

const REPORT_TYPES = [
  { value: "COPYRIGHT", label: "저작권 침해" },
  { value: "WRONG_INFO", label: "잘못된 정보" },
  { value: "OTHER", label: "기타" },
];

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = Number(courseId);
  const { user, isLoggedIn, isInstructor } = useAuth();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("OTHER");
  const [reportContent, setReportContent] = useState("");
  const [reportDone, setReportDone] = useState(false);

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

  const reportMutation = useMutation({
    mutationFn: () =>
      createReport(numericCourseId, {
        userId: user!.id,
        type: reportType,
        content: reportContent,
      }),
    onSuccess: () => {
      setReportDone(true);
      setReportContent("");
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

              {isLoggedIn && !isOwnCourse && (
                <div style={{ marginTop: 14 }}>
                  <button
                    type="button"
                    className="button button--ghost"
                    style={{ width: "100%", fontSize: "0.82rem", opacity: 0.6 }}
                    onClick={() => { setShowReportModal(true); setReportDone(false); }}
                  >
                    이 강의 신고하기
                  </button>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />

      {showReportModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowReportModal(false)}
        >
          <div
            style={{
              background: "var(--surface-primary, #18181b)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 20,
              width: "100%", maxWidth: 460,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "20px 24px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 18, lineHeight: 1,
                  background: "rgba(239,68,68,0.12)",
                  color: "#ef4444",
                  borderRadius: 8,
                  padding: "6px 8px",
                }}>
                  ⚑
                </span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>강의 신고</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: 20, lineHeight: 1,
                  padding: "4px 6px", borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* 구분선 */}
            <div style={{ height: 1, background: "var(--border-subtle)", margin: "16px 0 0" }} />

            {reportDone ? (
              <div style={{ padding: "40px 24px 28px", textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(34,197,94,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: 26,
                }}>
                  ✓
                </div>
                <p style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 6 }}>신고가 접수되었습니다</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                  검토 후 적절한 조치를 취하겠습니다.
                </p>
                <button
                  type="button"
                  className="button button--primary"
                  style={{ marginTop: 24, width: "100%" }}
                  onClick={() => setShowReportModal(false)}
                >
                  확인
                </button>
              </div>
            ) : (
              <div style={{ padding: "20px 24px 24px" }}>
                {/* 신고 유형 버튼 그룹 */}
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    신고 유형
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {REPORT_TYPES.map((t) => {
                      const selected = reportType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setReportType(t.value)}
                          style={{
                            flex: 1,
                            padding: "9px 4px",
                            borderRadius: 10,
                            border: selected
                              ? "1.5px solid var(--accent-primary)"
                              : "1.5px solid var(--border-subtle)",
                            background: selected
                              ? "rgba(var(--accent-primary-rgb, 99,102,241), 0.1)"
                              : "transparent",
                            color: selected ? "var(--accent-primary)" : "var(--text-muted)",
                            fontWeight: selected ? 700 : 500,
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 신고 내용 */}
                <div style={{ marginBottom: 6 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    신고 내용
                  </p>
                  <textarea
                    rows={5}
                    placeholder="신고 사유를 구체적으로 입력해 주세요. (최소 10자)"
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1.5px solid var(--border-subtle)",
                      background: "var(--surface-secondary)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      transition: "border-color 0.15s ease",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    {reportContent.length > 0 && reportContent.trim().length < 10 ? (
                      <p style={{ fontSize: 12, color: "var(--error, #ef4444)" }}>
                        최소 10자 이상 입력해 주세요.
                      </p>
                    ) : (
                      <span />
                    )}
                    <p style={{ fontSize: 12, color: reportContent.trim().length >= 10 ? "var(--text-muted)" : "var(--error, #ef4444)" }}>
                      {reportContent.trim().length} / 10+
                    </p>
                  </div>
                </div>

                {reportMutation.isError && (
                  <div style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 14,
                  }}>
                    <p style={{ color: "#ef4444", fontSize: 13 }}>신고 접수 중 오류가 발생했습니다. 다시 시도해 주세요.</p>
                  </div>
                )}

                {/* 버튼 */}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    className="button button--ghost"
                    style={{ flex: 1 }}
                    onClick={() => setShowReportModal(false)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="button button--primary"
                    style={{ flex: 2 }}
                    disabled={reportContent.trim().length < 10 || reportMutation.isPending}
                    onClick={() => reportMutation.mutate()}
                  >
                    {reportMutation.isPending ? "접수 중..." : "신고 접수"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
