import type { RoadmapItem } from "../../types/types";

type RoadmapSectionProps = {
  items: RoadmapItem[];
};

export function RoadmapSection({ items }: RoadmapSectionProps) {
  return (
    <section className="section">
      <div className="site-container roadmap-panel">
        <div className="roadmap-panel__intro">
          <p className="eyebrow">학습 로드맵</p>
          <h2>막히기 전에 다음 학습 흐름을 볼 수 있게 정리했습니다</h2>
          <p>
            메인 페이지에서 바로 학습 단계와 추천 방향을 볼 수 있도록 별도 section으로
            분리해 두었습니다.
          </p>
        </div>

        <div className="roadmap-list">
          {items.map((item) => (
            <article key={item.label} className="roadmap-item">
              <span>{item.icon}</span>
              <div>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
