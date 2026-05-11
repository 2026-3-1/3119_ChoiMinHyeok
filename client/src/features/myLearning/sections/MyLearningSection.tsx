import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyLearning } from "../../shared/api/api";
import { useAuth } from "../../shared/context/AuthContext";
import { LearningCard } from "../components/LearningCard";

export function MyLearningSection() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["my-learning", user?.id],
    queryFn: () => getMyLearning(user!.id),
    enabled: isLoggedIn && !!user,
    staleTime: 1000 * 60,
  });

  return (
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
            <LearningCard key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
