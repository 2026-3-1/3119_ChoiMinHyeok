import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/shared/context/AuthContext";
import { BrandLogo } from "../../features/shared/components/BrandLogo";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-card__title" style={{ textAlign: "center" }}>접근 권한 없음</p>
          <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 20 }}>
            관리자 계정으로 로그인해주세요.
          </p>
          <button className="button button--primary" style={{ width: "100%" }} onClick={() => navigate("/admin/login")}>
            관리자 로그인
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout().finally(() => navigate("/admin/login"));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "var(--surface-secondary)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <BrandLogo />
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Admin Panel</p>
        </div>

        <nav style={{ flex: 1, padding: "16px 0" }}>
          {[
            { to: "/admin/dashboard", label: "대시보드" },
            { to: "/admin/users", label: "사용자 관리" },
            { to: "/admin/courses", label: "강의 관리" },
            { to: "/admin/categories", label: "카테고리 관리" },
            { to: "/admin/reports", label: "신고 관리" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "block",
                padding: "10px 20px",
                fontSize: 14,
                textDecoration: "none",
                color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--surface-tertiary)" : "transparent",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{user.name}</p>
          <button className="button button--ghost" style={{ width: "100%", fontSize: 13 }} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
