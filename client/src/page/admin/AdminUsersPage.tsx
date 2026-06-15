import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  banAdminUser,
  changeAdminUserRole,
  deleteAdminUser,
  getAdminUsers,
  unbanAdminUser,
} from "../../features/shared/api/api";
import type { UserRole } from "../../features/shared/types";
import { useAuth } from "../../features/shared/context/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "학생",
  INSTRUCTOR: "강사",
  ADMIN: "관리자",
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role, page],
    queryFn: () => getAdminUsers({ search: search || undefined, role: role || undefined, page, limit }),
  });

  const banMutation = useMutation({
    mutationFn: (userId: number) => banAdminUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: number) => unbanAdminUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteAdminUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
      changeAdminUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin</p>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>사용자 관리</h2>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          className="auth-form__input"
          style={{ maxWidth: 280 }}
          placeholder="이름 또는 이메일 검색"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="auth-form__input"
          style={{ maxWidth: 160 }}
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
        >
          <option value="">전체 역할</option>
          <option value="STUDENT">학생</option>
          <option value="INSTRUCTOR">강사</option>
          <option value="ADMIN">관리자</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)" }}>로딩 중...</div>
      ) : !data || data.data.length === 0 ? (
        <div className="empty-state">
          <strong>사용자가 없습니다</strong>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>가입일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => (
                  <tr key={u.id} style={{ opacity: u.isBanned ? 0.6 : 1 }}>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{u.id}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {u.name}
                        {u.isBanned && (
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "2px 6px",
                            borderRadius: 4, background: "rgba(239,68,68,0.15)",
                            color: "#ef4444", letterSpacing: "0.03em",
                          }}>
                            정지됨
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{u.email}</td>
                    <td>
                      <select
                        className="auth-form__input"
                        style={{ fontSize: 12, minHeight: 30, padding: "0 8px", maxWidth: 110 }}
                        value={u.role}
                        disabled={roleMutation.isPending || u.isBanned}
                        onChange={(e) => {
                          if (window.confirm(`역할을 "${ROLE_LABELS[e.target.value]}"으로 변경하시겠습니까?`)) {
                            roleMutation.mutate({ userId: u.id, role: e.target.value as UserRole });
                          }
                        }}
                      >
                        <option value="STUDENT">학생</option>
                        <option value="INSTRUCTOR">강사</option>
                        <option value="ADMIN">관리자</option>
                      </select>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        {u.isBanned ? (
                          <button
                            className="button button--ghost"
                            style={{ fontSize: 12, padding: "3px 10px", color: "var(--success, #22c55e)" }}
                            disabled={unbanMutation.isPending || u.id === currentUser?.id}
                            onClick={() => unbanMutation.mutate(u.id)}
                          >
                            정지 해제
                          </button>
                        ) : (
                          <button
                            className="button button--ghost"
                            style={{ fontSize: 12, padding: "3px 10px", color: "var(--error)" }}
                            disabled={banMutation.isPending || u.id === currentUser?.id}
                            onClick={() => {
                              if (window.confirm(`"${u.name}" 사용자를 정지하시겠습니까?\n정지된 사용자는 로그인할 수 없습니다.`)) {
                                banMutation.mutate(u.id);
                              }
                            }}
                          >
                            정지
                          </button>
                        )}
                        <button
                          className="button button--ghost"
                          style={{ fontSize: 12, padding: "3px 10px", color: "var(--error)" }}
                          disabled={deleteMutation.isPending || u.id === currentUser?.id}
                          onClick={() => {
                            if (window.confirm(`"${u.name}" 사용자를 삭제하시겠습니까?`)) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
