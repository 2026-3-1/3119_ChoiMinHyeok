type BrandLogoProps = {
  size?: "sm" | "md";
};

const sizeClassMap = {
  sm: {
    badge: "h-6 w-6 text-[10px]",
    text: "text-sm",
  },
  md: {
    badge: "h-8 w-8 text-xs",
    text: "text-lg",
  },
} as const;

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  const classes = sizeClassMap[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center rounded bg-[#00ff88] font-mono font-black text-black ${classes.badge}`}
      >
        S
      </div>
      <span className={`font-display font-black tracking-tight ${classes.text}`}>
        sec<span className="text-[#00ff88]">101</span>
      </span>
    </div>
  );
}
