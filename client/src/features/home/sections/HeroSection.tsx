import { Link } from "react-router-dom";
import type { HeroCategory, HeroStat } from "../../types/types";

type HeroSectionProps = {
  stats: HeroStat[];
  categories: HeroCategory[];
};

export function HeroSection({ stats, categories }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <div className="site-container hero-section__grid">
        <div>
          <p className="eyebrow">보안 학습 플랫폼</p>
          <h1 className="hero-section__title">
            <p className="text-green-300">실전 보안 학습 경험</p>
          </h1>
          <p className="hero-section__text">
            보안 관련 실습을 제공하는 sec101
          </p>

          <div className="hero-section__actions">
            <Link to="/courses" className="button button--primary">
              강의 둘러보기
            </Link>
            <a href="#featured-courses" className="button button--ghost">
              추천 강의 보기
            </a>
          </div>

          <div className="stat-strip">
            {stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-grid">
          {categories.map((category) => (
            <article
              key={category.label}
              className="hero-grid__card"
              style={{ borderColor: `${category.accent}55` }}
            >
              <span className="hero-grid__icon">{category.icon}</span>
              <strong>{category.label}</strong>
              <span>{category.count}개 트랙</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
