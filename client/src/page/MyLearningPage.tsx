import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/shared/context/AuthContext";
import { SiteHeader } from "../features/shared/layout/SiteHeader";
import { SiteFooter } from "../features/shared/layout/SiteFooter";
import { MyLearningSection } from "../features/myLearning/sections/MyLearningSection";

export default function MyLearningPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="page-shell">
        <SiteHeader />
        <main className="page-main">
          <div className="site-container">
            <div className="empty-state" style={{ marginTop: "60px" }}>
              <strong>로그인이 필요합니다</strong>
              <p>내 학습 목록을 보려면 먼저 로그인해주세요.</p>
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
          <MyLearningSection />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
