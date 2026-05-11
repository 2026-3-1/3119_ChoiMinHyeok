import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminReports, resolveAdminReport } from "../../features/shared/api/api";

const reportTypeLabel: Record<string, string> = {
  COPYRIGHT: "저작권 침해",
  SPAM: "스팸/광고",
  INAPPROPRIATE: "부적절한 내용",
  MISINFORMATION: "잘못된 정보",
  OTHER: "기타",
};

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [filterResolved, setFilterResolved] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const params = {
    isResolved: filterResolved === "" ? undefined : filterResolved === "true",
    page,
    limit,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", filterResolved, page],
    queryFn: () => getAdminReports(params),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, isResolved }: { reportId: number; isResolved: boolean }) =>
      resolveAdminReport(reportId, isResolved),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reports"] }),
  });

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin</p>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>신고 관리</h2>
      </div>

      <div style={{ marginBottom: 24 }}>
        <select
          className="auth-form__input"
          style={{ maxWidth: 180 }}
          value={filterResolved}
          onChange={(e) => { setFilterResolved(e.target.value); setPage(1); }}
        >
          <option value="">전체</option>
          <option value="false">미처리</option>
          <option value="true">처리 완료</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)" }}>로딩 중...</div>
      ) : !data || data.data.length === 0 ? (
        <div className="empty-state">
          <strong>신고가 없습니다</strong>
        </div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>유형</th>
                  <th>내용</th>
                  <th>강의 ID</th>
                  <th>신고자 ID</th>
                  <th>상태</th>
                  <th>신고일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{r.id}</td>
                    <td style={{ fontSize: 13 }}>{reportTypeLabel[r.type] ?? r.type}</td>
                    <td style={{ fontSize: 13, maxWidth: 280 }}>
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {r.content}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.courseId}</td>
                    <td style={{ fontSize: 13 }}>{r.userId}</td>
                    <td>
                      <span
                        className={`badge badge--${r.isResolved ? "success" : "warning"}`}
                        style={{ fontSize: 12 }}
                      >
                        {r.isResolved ? "처리 완료" : "미처리"}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td>
                      <button
                        className="button button--ghost"
                        style={{ fontSize: 12, padding: "3px 10px" }}
                        disabled={resolveMutation.isPending}
                        onClick={() =>
                          resolveMutation.mutate({ reportId: r.id, isResolved: !r.isResolved })
                        }
                      >
                        {r.isResolved ? "미처리로 변경" : "처리 완료"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
