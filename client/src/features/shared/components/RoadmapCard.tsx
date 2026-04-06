type RoadmapCardProps = {
  icon: string;
  label: string;
  description: string;
};

export function RoadmapCard({
  icon,
  label,
  description,
}: RoadmapCardProps) {
  return (
    <div className="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-all hover:border-[#00ff88]/40">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm font-bold text-white transition-colors group-hover:text-[#00ff88]">
          {label}
        </div>
        <div className="text-xs text-[#445]">{description}</div>
      </div>
      <span className="ml-auto text-[#334] transition-colors group-hover:text-[#00ff88]">
        →
      </span>
    </div>
  );
}
