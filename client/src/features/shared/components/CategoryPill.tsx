type CategoryPillProps = {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
};

export function CategoryPill({
  icon,
  label,
  active,
  onClick,
}: CategoryPillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
        active
          ? "border-[#00ff88] bg-[#00ff88] text-black"
          : "border-[#1e2a3a] bg-transparent text-[#556] hover:border-[#00ff88]/40 hover:text-[#00ff88]"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
