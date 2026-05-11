import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";
import { ProfileSection } from "../features/myPage/sections/ProfileSection";
import { InstructorDashboardSection } from "../features/myPage/sections/InstructorDashboardSection";
import { StudentLearningSection } from "../features/myPage/sections/StudentLearningSection";

export default function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isInstructor, logout } = useAuth();

  const handleLogout = () => logout().finally(() => navigate("/"));

  if (!isLoggedIn || !user) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container">
            <div className="empty-state" style={{ marginTop: 60 }}>
              <strong>로그인이 필요합니다</strong>
              <button className="button button--primary" onClick={() => navigate("/login")}>
                로그인하기
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
          <ProfileSection user={user} isInstructor={isInstructor} onLogout={handleLogout} />
          {isInstructor ? <InstructorDashboardSection /> : <StudentLearningSection />}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
