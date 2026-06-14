import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useScrolled } from "../hooks/useScrolled";
import { BrandLogo } from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../api/api";

export function SiteHeader() {
  const isScrolled = useScrolled();
  const navigate = useNavigate();
  const { user, isLoggedIn, isInstructor, logout } = useAuth();

  const { data: cart } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => getCart(user!.id),
    enabled: isLoggedIn && !!user && !isInstructor,
    staleTime: 1000 * 30,
  });

  const cartCount = cart?.totalCount ?? 0;

  const handleLogout = () => {
    logout().finally(() => navigate("/"));
  };

  return (
    <header className={isScrolled ? "site-header site-header--scrolled" : "site-header"}>
      <div className="site-container site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="sec101 home">
          <BrandLogo />
        </Link>

        <nav className="site-header__nav">
          <Link to="/courses" className="site-header__link">강의</Link>
          {isLoggedIn && !isInstructor && (
            <Link to="/my-learning" className="site-header__link">내 학습</Link>
          )}
          {isLoggedIn && isInstructor && (
            <Link to="/instructor/courses" className="site-header__link">강사 관리</Link>
          )}
        </nav>

        <div className="site-header__actions">
          {isLoggedIn ? (
            <>
              {isInstructor ? (
                <span
                  className="site-header__cart site-header__cart--disabled"
                  aria-label="강사 계정은 장바구니를 이용할 수 없습니다"
                  title="강사 계정은 장바구니를 이용할 수 없습니다"
                >
                  <span className="site-header__cart-icon">🛒</span>
                </span>
              ) : (
                <Link to="/cart" className="site-header__cart" aria-label="장바구니">
                  <span className="site-header__cart-icon">🛒</span>
                  {cartCount > 0 && (
                    <span className="site-header__cart-badge">{cartCount}</span>
                  )}
                </Link>
              )}
              <Link to="/my-page" className="site-header__link" style={{ fontWeight: 600 }}>
                {user!.name}
              </Link>
              <button className="button button--ghost" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button--ghost">
                로그인
              </Link>
              <Link to="/register" className="button button--primary">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
