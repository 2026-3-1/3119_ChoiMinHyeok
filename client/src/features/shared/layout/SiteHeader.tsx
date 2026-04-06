import { Link } from "react-router-dom";
import { useScrolled } from "../hooks/useScrolled";
import { BrandLogo } from "../components/BrandLogo";

export function SiteHeader() {
  const isScrolled = useScrolled();

  return (
    <header className={isScrolled ? "site-header site-header--scrolled" : "site-header"}>
      <div className="site-container site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="sec101 home">
          <BrandLogo />
        </Link>

        <div className="site-header__actions">
          <Link to="/courses" className="button button--ghost">
            강의 둘러보기
          </Link>
          <Link to="/courses" className="button button--primary">
            학습 시작
          </Link>
        </div>
      </div>
    </header>
  );
}
