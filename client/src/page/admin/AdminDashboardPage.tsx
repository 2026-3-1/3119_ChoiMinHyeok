import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard, getSystemHealth } from "../../features/shared/api/api";

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

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}일 ${h}시간`;
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

const ROLE_LABELS: Record<string, string> = { STUDENT: "학생", INSTRUCTOR: "강사", ADMIN: "관리자" };

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    refetchInterval: 60_000,
  });

  const { data: sysData } = useQuery({
    queryKey: ["system-health"],
    queryFn: getSystemHealth,
    refetchInterval: 30_000,
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

          {/* 이번 달 요약 + 강의 현황 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
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

            {data.courseStatusBreakdown && (
              <div
                style={{
                  background: "var(--surface-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 16,
                  padding: "20px 24px",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>강의 현황</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "운영 중", value: data.courseStatusBreakdown.open, color: "var(--success, #22c55e)" },
                    { label: "초안", value: data.courseStatusBreakdown.draft, color: "var(--text-muted)" },
                    { label: "취소됨", value: data.courseStatusBreakdown.canceled, color: "var(--error)" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 24, fontWeight: 700, color }}>{value}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 최근 결제 + 최근 가입 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {data.recentOrders && data.recentOrders.length > 0 && (
              <div
                style={{
                  background: "var(--surface-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 16,
                  padding: "20px 24px",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>최근 결제</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.recentOrders.map((order) => (
                    <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{order.userName}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{order.userEmail}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-primary)" }}>
                          ₩{order.amount.toLocaleString("ko-KR")}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.recentSignups && data.recentSignups.length > 0 && (
              <div
                style={{
                  background: "var(--surface-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 16,
                  padding: "20px 24px",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>최근 가입</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.recentSignups.map((u) => (
                    <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 시스템 모니터링 */}
          {sysData && (
            <div
              style={{
                background: "var(--surface-secondary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 16,
                padding: "20px 24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 600 }}>서버 모니터링</p>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: sysData.status === "ok" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color: sysData.status === "ok" ? "#22c55e" : "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  {sysData.status === "ok" ? "● 정상" : "● 오류"}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>업타임</p>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>{formatUptime(sysData.uptime)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>힙 사용</p>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>{sysData.memory.heapUsed} MB</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>힙 전체</p>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>{sysData.memory.heapTotal} MB</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>RSS</p>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>{sysData.memory.rss} MB</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Node.js</p>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>{sysData.nodeVersion}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>환경</p>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>{sysData.environment}</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
