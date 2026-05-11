import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInstructorCourses } from "../../shared/api/api";
import { useAuth } from "../../shared/context/AuthContext";

const difficultyLabel: Record<string, string> = { EASY: "입문", MEDIUM: "중급", HARD: "고급" };
const statusLabel: Record<string, string> = { OPEN: "공개", CLOSED: "비공개", DRAFT: "초안" };

function formatPrice(n: number) {
  return n === 0 ? "무료" : `₩${n.toLocaleString("ko-KR")}`;
}

export function InstructorDashboardSection() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: getInstructorCourses,
    enabled: isLoggedIn,
  });

  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Instructor</p>
          <h2>강사 관리</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="button button--primary" onClick={() => navigate("/instructor/courses/new")}>
            + 새 강의 만들기
          </button>
          <button className="button button--ghost" onClick={() => navigate("/instructor/courses")}>
            전체 보기
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)", padding: "24px 0" }}>불러오는 중...</div>
      ) : courses?.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 0 }}>
          <strong>개설한 강의가 없습니다</strong>
          <p>첫 번째 강의를 만들어보세요.</p>
          <button className="button button--primary" onClick={() => navigate("/instructor/courses/new")}>
            강의 만들기
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {(courses ?? []).slice(0, 5).map((c) => (
            <div
              key={c.id}
              className="cart-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/instructor/courses/${c.id}/edit`)}
            >
              <div className="cart-item__info" style={{ flex: 1 }}>
                <strong className="cart-item__title">{c.title}</strong>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {difficultyLabel[c.difficulty] ?? c.difficulty} · {formatPrice(c.price)} · 최대 {c.maxCapacity}명
                </span>
              </div>
              <span className={`badge badge--${c.status === "OPEN" ? "success" : "neutral"}`}>
                {statusLabel[c.status] ?? c.status}
              </span>
              <button
                className="button button--ghost"
                style={{ fontSize: 12, padding: "3px 10px" }}
                onClick={(e) => { e.stopPropagation(); navigate(`/instructor/courses/${c.id}/edit`); }}
              >
                편집
              </button>
            </div>
          ))}
          {(courses?.length ?? 0) > 5 && (
            <button
              className="button button--ghost"
              style={{ width: "100%" }}
              onClick={() => navigate("/instructor/courses")}
            >
              전체 {courses?.length}개 보기
            </button>
          )}
        </div>
      )}
    </section>
  );
}
