import type { CounterStat } from "../../shared/types";

type StatsSectionProps = {
  stats: CounterStat[];
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="section">
      <div className="site-container stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stats-grid__card">
            <strong>
              {stat.end.toLocaleString()}
              {stat.suffix}
            </strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

