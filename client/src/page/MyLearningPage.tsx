import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyLearning } from "../features/shared/api/api";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar">
      <div className="progress-bar__fill" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function MyLearningPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["my-learning", user?.id],
    queryFn: () => getMyLearning(user!.id),
    enabled: isLoggedIn && !!user,
    staleTime: 1000 * 60,
  });

  if (!isLoggedIn) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container">
            <div className="empty-state" style={{ marginTop: "60px" }}>
              <strong>로그인이 필요합니다</strong>
              <p>내 학습 목록을 보려면 먼저 로그인해주세요.</p>
              <button className="button button--primary" onClick={() => navigate("/login")}>
                로그인하기
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="page-main">
        <div className="site-container">
          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">My Learning</p>
                <h2>내 학습 목록</h2>
              </div>
              <span className="section-copy">{user?.name}님의 수강 중인 강의</span>
            </div>

            {isLoading ? (
              <div className="my-learning-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="learning-card learning-card--skeleton">
                    <div className="skeleton-block" style={{ height: 160, borderRadius: 16 }} />
                    <div style={{ padding: "16px", display: "grid", gap: 10 }}>
                      <div className="skeleton-line skeleton-line--md" />
                      <div className="skeleton-line skeleton-line--sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="empty-state">
                <strong>수강 중인 강의가 없습니다</strong>
                <p>원하는 강의를 장바구니에 담고 결제하면 학습을 시작할 수 있어요.</p>
                <button className="button button--primary" onClick={() => navigate("/courses")}>
                  강의 둘러보기
                </button>
              </div>
            ) : (
              <div className="my-learning-grid">
                {courses.map((course) => (
                  <div key={course.courseId} className="learning-card">
                    <div className="learning-card__media">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="learning-card__image"
                        />
                      ) : (
                        <div className="learning-card__placeholder">SEC</div>
                      )}
                      <div className="learning-card__progress-overlay">
                        <span>{course.progressPercent}%</span>
                      </div>
                    </div>

                    <div className="learning-card__body">
                      <strong className="learning-card__title">{course.title}</strong>
                      <ProgressBar value={course.progressPercent} />
                      <p className="learning-card__meta">
                        진도율 {course.progressPercent}%
                      </p>

                      <button
                        className="button button--primary"
                        style={{ width: "100%", marginTop: 4 }}
                        onClick={() => {
                          if (course.lastLectureId) {
                            navigate(
                              `/courses/${course.courseId}/learn/${course.lastLectureId}`
                            );
                          } else {
                            navigate(`/courses/${course.courseId}`);
                          }
                        }}
                      >
                        {course.lastLectureId ? "이어보기" : "강의 시작하기"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
