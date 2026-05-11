export function StarRating({ value }: { value: number }) {
  return (
    <span className="review-stars" aria-label={`${value}점`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < value ? "#fbbf24" : "#374151" }}>★</span>
      ))}
    </span>
  );
}
