import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyLearning } from "../../shared/api/api";
import { useAuth } from "../../shared/context/AuthContext";

export function StudentLearningSection() {
  const { user, isLoggedIn } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["my-learning", user?.id],
    queryFn: () => getMyLearning(user!.id),
    enabled: isLoggedIn && !!user,
  });

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Learning</p>
          <h2>내 학습</h2>
        </div>
        <Link to="/my-learning" className="button button--ghost">전체 보기</Link>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)", padding: "24px 0" }}>불러오는 중...</div>
      ) : courses?.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 0 }}>
          <strong>수강 중인 강의가 없습니다</strong>
          <p>강의를 둘러보고 학습을 시작하세요.</p>
          <Link to="/courses" className="button button--primary">강의 둘러보기</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {(courses ?? []).slice(0, 4).map((item) => (
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
  );
}
