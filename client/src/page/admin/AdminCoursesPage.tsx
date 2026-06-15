import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { deleteAdminCourse, getAdminCourses, setAdminCourseStatus } from "../../features/shared/api/api";

const difficultyLabel: Record<string, string> = { EASY: "입문", MEDIUM: "중급", HARD: "고급" };
const statusLabel: Record<string, string> = { OPEN: "공개", DRAFT: "초안", CANCELED: "취소됨" };

function formatPrice(n: number) {
  return n === 0 ? "무료" : `₩${n.toLocaleString("ko-KR")}`;
}

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses", search, status, page],
    queryFn: () => getAdminCourses({ search: search || undefined, status: status || undefined, page, limit }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ courseId, status }: { courseId: number; status: string }) =>
      setAdminCourseStatus(courseId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId: number) => deleteAdminCourse(courseId),
    onMutate: () => setDeleteError(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
    onError: (err) => {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "삭제에 실패했습니다.")
        : "삭제에 실패했습니다.";
      setDeleteError(message);
    },
  });

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin</p>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>강의 관리</h2>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          className="auth-form__input"
          style={{ maxWidth: 280 }}
          placeholder="강의명 검색"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="auth-form__input"
          style={{ maxWidth: 160 }}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">전체 상태</option>
          <option value="OPEN">공개</option>
          <option value="CLOSED">비공개</option>
          <option value="DRAFT">초안</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)" }}>로딩 중...</div>
      ) : !data || data.data.length === 0 ? (
        <div className="empty-state">
          <strong>강의가 없습니다</strong>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>강의명</th>
                  <th>난이도</th>
                  <th>가격</th>
                  <th>상태</th>
                  <th>생성일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{c.id}</td>
                    <td>{c.title}</td>
                    <td>{difficultyLabel[c.difficulty] ?? c.difficulty}</td>
                    <td>{formatPrice(c.price)}</td>
                    <td>
                      <select
                        className="auth-form__input"
                        style={{
                          fontSize: 12,
                          padding: "3px 8px",
                          minHeight: 28,
                          width: "auto",
                          color:
                            c.status === "OPEN"
                              ? "var(--success, #22c55e)"
                              : c.status === "DRAFT"
                              ? "var(--text-muted)"
                              : "var(--error, #ef4444)",
                        }}
                        value={c.status}
                        disabled={statusMutation.isPending}
                        onChange={(e) => {
                          if (e.target.value !== c.status)
                            statusMutation.mutate({ courseId: c.id, status: e.target.value });
                        }}
                      >
                        <option value="OPEN">공개</option>
                        <option value="DRAFT">초안</option>
                        <option value="CANCELED">취소됨</option>
                      </select>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td>
                      <button
                        className="button button--ghost"
                        style={{ fontSize: 12, padding: "3px 10px", color: "var(--error)" }}
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`"${c.title}" 강의를 삭제하시겠습니까?`)) {
                            deleteMutation.mutate(c.id);
                          }
                        }}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {deleteError && (
            <div
              style={{
                marginTop: 16,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <p style={{ color: "#ef4444", fontSize: 13 }}>{deleteError}</p>
              <button
                type="button"
                onClick={() => setDeleteError(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            <button
              className="button button--ghost"
              style={{ fontSize: 13, padding: "6px 16px" }}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </button>
            <span style={{ lineHeight: "36px", fontSize: 13, color: "var(--text-muted)" }}>
              {page} / {totalPages}
            </span>
            <button
              className="button button--ghost"
              style={{ fontSize: 13, padding: "6px 16px" }}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
