import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteInstructorCourse, getInstructorCourses, setInstructorCourseStatus } from "../../features/shared/api/api";
import { useAuth } from "../../features/shared/context/AuthContext";
import { SiteHeader } from "../../features/shared/layout/SiteHeader";
import { SiteFooter } from "../../features/shared/layout/SiteFooter";
import type { CourseStatus } from "../../features/shared/types";

const difficultyLabel: Record<string, string> = { EASY: "입문", MEDIUM: "중급", HARD: "고급" };
const statusLabel: Record<string, string> = { OPEN: "공개", CLOSED: "비공개", DRAFT: "초안" };

function formatPrice(n: number) {
  return n === 0 ? "무료" : `₩${n.toLocaleString("ko-KR")}`;
}

export default function InstructorCoursesPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isInstructor } = useAuth();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: getInstructorCourses,
    enabled: isLoggedIn && isInstructor,
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: number) => deleteInstructorCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      setConfirmDelete(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ courseId, status }: { courseId: number; status: CourseStatus }) =>
      setInstructorCourseStatus(courseId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["instructor-courses"] }),
  });

  if (!isLoggedIn || !user || !isInstructor) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container">
            <div className="empty-state" style={{ marginTop: 60 }}>
              <strong>접근 권한이 없습니다</strong>
              <p>강사 계정으로 로그인해주세요.</p>
              <button className="button button--primary" onClick={() => navigate("/login")}>
                로그인
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
                <p className="eyebrow">Instructor</p>
                <h2>내 강의 관리</h2>
              </div>
              <button
                className="button button--primary"
                onClick={() => navigate("/instructor/courses/new")}
              >
                + 새 강의 만들기
              </button>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                로딩 중...
              </div>
            ) : courses.length === 0 ? (
              <div className="empty-state">
                <strong>등록된 강의가 없습니다</strong>
                <p>아직 개설한 강의가 없습니다. 새 강의를 만들어보세요.</p>
                <button
                  className="button button--primary"
                  onClick={() => navigate("/instructor/courses/new")}
                >
                  첫 강의 만들기
                </button>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>강의명</th>
                      <th>난이도</th>
                      <th>가격</th>
                      <th>상태</th>
                      <th>수용인원</th>
                      <th>평점</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <span
                            style={{ cursor: "pointer", color: "var(--accent-primary)" }}
                            onClick={() => navigate(`/instructor/courses/${c.id}/edit`)}
                          >
                            {c.title}
                          </span>
                        </td>
                        <td>{difficultyLabel[c.difficulty] ?? c.difficulty}</td>
                        <td>{formatPrice(c.price)}</td>
                        <td>
                          <span className={`badge badge--${c.status === "OPEN" ? "success" : "neutral"}`}>
                            {statusLabel[c.status] ?? c.status}
                          </span>
                        </td>
                        <td>{c.maxCapacity}명</td>
                        <td>{c.rating > 0 ? c.rating.toFixed(1) : "-"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {c.status !== "CANCELED" && (
                              <button
                                className="button button--ghost"
                                style={{
                                  fontSize: 13,
                                  padding: "4px 12px",
                                  color: c.status === "DRAFT" ? "var(--accent-primary)" : "var(--text-muted)",
                                }}
                                disabled={statusMutation.isPending}
                                onClick={() =>
                                  statusMutation.mutate({
                                    courseId: c.id,
                                    status: c.status === "OPEN" ? "DRAFT" : "OPEN",
                                  })
                                }
                              >
                                {c.status === "OPEN" ? "비공개" : "공개"}
                              </button>
                            )}
                            <button
                              className="button button--ghost"
                              style={{ fontSize: 13, padding: "4px 12px" }}
                              onClick={() => navigate(`/instructor/courses/${c.id}/edit`)}
                            >
                              편집
                            </button>
                            {confirmDelete === c.id ? (
                              <>
                                <button
                                  className="button button--danger"
                                  style={{ fontSize: 13, padding: "4px 12px" }}
                                  disabled={deleteMutation.isPending}
                                  onClick={() => deleteMutation.mutate(c.id)}
                                >
                                  확인
                                </button>
                                <button
                                  className="button button--ghost"
                                  style={{ fontSize: 13, padding: "4px 12px" }}
                                  onClick={() => setConfirmDelete(null)}
                                >
                                  취소
                                </button>
                              </>
                            ) : (
                              <button
                                className="button button--ghost"
                                style={{ fontSize: 13, padding: "4px 12px", color: "var(--error)" }}
                                onClick={() => setConfirmDelete(c.id)}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
