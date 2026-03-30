type HeroCategoryCardProps = {
  icon: string;
  label: string;
  count: number;
  accent: string;
};

export function HeroCategoryCard({
  icon,
  label,
  count,
  accent,
}: HeroCategoryCardProps) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[#1e2a3a] bg-[#0d1117] px-4 py-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{ ["--accent" as string]: accent }}
    >
      <span className="text-xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-white transition-colors group-hover:text-(--accent)">
          {label}
        </p>
        <p className="font-mono text-[10px] text-[#445]">{count}개 강좌</p>
      </div>
      <span className="text-xs text-[#223] transition-colors group-hover:text-(--accent)">
        →
      </span>
    </div>
  );
}
