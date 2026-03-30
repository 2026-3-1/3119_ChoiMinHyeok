import { footerLinks } from "../../data";
import { BrandLogo } from "../../main/components/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer__inner">
        <BrandLogo size="sm" />

        <p className="site-footer__copy">SEC101 · 실전 보안 학습을 위한 플랫폼</p>

        <div className="site-footer__links">
          {footerLinks.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
