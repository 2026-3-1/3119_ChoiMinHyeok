import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyBookmarks, getMyLearning } from "../../shared/api/api";
import { useAuth } from "../../shared/context/AuthContext";
import { formatDuration } from "../../shared/utils";

export function StudentLearningSection() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
  } = useQuery({
    queryKey: ["my-learning", user?.id],
    queryFn: () => getMyLearning(user!.id),
    enabled: isLoggedIn && !!user,
  });

  const {
    data: bookmarks = [],
    isLoading: bookmarksLoading,
    isError: bookmarksError,
  } = useQuery({
    queryKey: ["my-bookmarks", user?.id],
    queryFn: () => getMyBookmarks(user!.id),
    enabled: isLoggedIn && !!user,
  });

  return (
    <>
      {/* 내 학습 */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Learning</p>
            <h2>내 학습</h2>
          </div>
          <Link to="/my-learning" className="button button--ghost">전체 보기</Link>
        </div>

        {coursesLoading ? (
          <div style={{ color: "var(--text-muted)", padding: "24px 0" }}>불러오는 중...</div>
        ) : coursesError ? (
          <div className="empty-state" style={{ marginTop: 0 }}>
            <strong>학습 목록을 불러오지 못했습니다</strong>
            <p>잠시 후 다시 시도해주세요.</p>
          </div>
        ) : !courses || courses.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 0 }}>
            <strong>수강 중인 강의가 없습니다</strong>
            <p>강의를 둘러보고 학습을 시작하세요.</p>
            <Link to="/courses" className="button button--primary">강의 둘러보기</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {courses.slice(0, 4).map((item) => (
              <div key={item.courseId} className="cart-item">
                <div className="cart-item__info" style={{ flex: 1 }}>
                  <strong className="cart-item__title">{item.title}</strong>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    진도 {item.progressPercent ?? 0}%
                  </span>
                </div>
                <Link
                  to={item.lastLectureId
                    ? `/courses/${item.courseId}/learn/${item.lastLectureId}`
                    : `/courses/${item.courseId}`}
                  className="button button--ghost"
                  style={{ fontSize: 12, padding: "3px 10px" }}
                >
                  이어보기
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 내 북마크 */}
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bookmarks</p>
            <h2>내 북마크 {bookmarks.length > 0 && <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 400 }}>({bookmarks.length})</span>}</h2>
          </div>
        </div>

        {bookmarksLoading ? (
          <div style={{ color: "var(--text-muted)", padding: "24px 0" }}>불러오는 중...</div>
        ) : bookmarksError ? (
          <div className="empty-state" style={{ marginTop: 0 }}>
            <strong>북마크를 불러오지 못했습니다</strong>
            <p>잠시 후 다시 시도해주세요.</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 0 }}>
            <strong>저장된 북마크가 없습니다</strong>
            <p>강의를 수강하는 중 🔖 버튼으로 북마크를 추가할 수 있어요.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {bookmarks.slice(0, 8).map((bm) => (
              <div
                key={bm.id}
                className="cart-item"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/courses/${bm.courseId}/learn/${bm.lectureId}`)}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {bm.courseTitle}
                  </span>
                  <strong style={{ fontSize: "0.92rem" }}>{bm.lectureTitle}</strong>
                  {bm.note && (
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {bm.note}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--accent-primary)",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔖 {formatDuration(bm.position)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
