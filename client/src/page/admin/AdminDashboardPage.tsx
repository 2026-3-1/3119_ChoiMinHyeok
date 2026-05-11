import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../../features/shared/api/api";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? "var(--accent-primary)" : "var(--surface-secondary)",
        border: `1px solid ${accent ? "transparent" : "var(--border-subtle)"}`,
        borderRadius: 16,
        padding: "24px 28px",
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: accent ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: accent ? "#fff" : "var(--text-primary)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.6)" : "var(--text-muted)", marginTop: 6 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function formatRevenue(n: number) {
  if (n >= 100_000_000) return `₩${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `₩${(n / 10_000).toFixed(0)}만`;
  return `₩${n.toLocaleString("ko-KR")}`;
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  const now = new Date();
  const monthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Admin</p>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>대시보드</h2>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-muted)" }}>로딩 중...</div>
      ) : isError ? (
        <div style={{ color: "var(--error)" }}>데이터를 불러오지 못했습니다.</div>
      ) : data ? (
        <>
          {/* 주요 지표 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <StatCard
              label="총 매출"
              value={formatRevenue(data.totalRevenue)}
              sub={`${monthLabel} ${formatRevenue(data.monthlyRevenue)}`}
              accent
            />
            <StatCard
              label="전체 회원"
              value={data.totalUsers.toLocaleString()}
              sub={`오늘 신규 +${data.newUsersToday}`}
            />
            <StatCard label="전체 강의" value={data.totalCourses.toLocaleString()} />
            <StatCard label="활성 수강" value={data.totalEnrollments.toLocaleString()} />
            <StatCard
              label="미처리 신고"
              value={data.pendingReports.toLocaleString()}
              sub={data.pendingReports > 0 ? "처리가 필요합니다" : "모두 처리됨"}
            />
          </div>

          {/* 이번 달 요약 */}
          <div
            style={{
              background: "var(--surface-secondary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: "20px 24px",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{monthLabel} 요약</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>이번 달 매출</p>
                <p style={{ fontSize: 22, fontWeight: 700 }}>{`₩${data.monthlyRevenue.toLocaleString("ko-KR")}`}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>오늘 신규 가입</p>
                <p style={{ fontSize: 22, fontWeight: 700 }}>{data.newUsersToday}명</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
